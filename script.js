// 투두리스트 애플리케이션
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentDate = new Date();
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.editingTodoId = null;
        
        this.init();
    }

    // 한국 시간으로 현재 날짜를 가져오는 메서드
    getKoreanDate() {
        const now = new Date();
        // 한국 시간대(Asia/Seoul)로 현재 시간을 가져옴
        const koreanTimeString = now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
        return new Date(koreanTimeString);
    }

    // 한국 시간으로 날짜 문자열을 생성하는 메서드
    getKoreanDateString(date = null) {
        const targetDate = date || this.getKoreanDate();
        // 한국 시간 기준으로 년, 월, 일을 가져옴
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    init() {
        this.setupEventListeners();
        this.renderTodoList();
        this.renderCalendar();
        this.setDefaultDate();
    }

    setupEventListeners() {
        // 뷰 토글 버튼
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleView(e.target.dataset.view);
            });
        });

        // 할 일 추가
        document.getElementById('addTodoBtn').addEventListener('click', () => {
            this.addTodo();
        });

        // Enter 키로 할 일 추가
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        // 필터 버튼
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterTodos(e.target.dataset.filter);
            });
        });

        // 달력 네비게이션
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.changeMonth(-1);
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.changeMonth(1);
        });

        // 모달 이벤트
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('saveEditBtn').addEventListener('click', () => {
            this.saveEdit();
        });

        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // 모달 외부 클릭으로 닫기
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('editModal')) {
                this.closeModal();
            }
        });
    }

    setDefaultDate() {
        const today = this.getKoreanDateString();
        document.getElementById('todoDate').value = today;
    }

    toggleView(view) {
        // 버튼 활성화 상태 변경
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // 뷰 변경
        document.querySelectorAll('.view-container').forEach(container => {
            container.classList.remove('active');
        });

        if (view === 'list') {
            document.querySelector('.list-view').classList.add('active');
        } else {
            document.querySelector('.calendar-view').classList.add('active');
            this.renderCalendar();
        }
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const dateInput = document.getElementById('todoDate');
        
        const text = input.value.trim();
        const date = dateInput.value;

        if (!text || !date) {
            alert('할 일과 날짜를 모두 입력해주세요.');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            date: date,
            completed: false,
            createdAt: this.getKoreanDate().toISOString()
        };

        this.todos.push(todo);
        this.saveTodos();
        this.renderTodoList();
        this.renderCalendar();

        input.value = '';
        this.setDefaultDate();
    }

    deleteTodo(id) {
        if (confirm('정말로 이 할 일을 삭제하시겠습니까?')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveTodos();
            this.renderTodoList();
            this.renderCalendar();
        }
    }

    toggleComplete(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodoList();
            this.renderCalendar();
        }
    }

    editTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            this.editingTodoId = id;
            document.getElementById('editTodoInput').value = todo.text;
            document.getElementById('editTodoDate').value = todo.date;
            document.getElementById('editModal').style.display = 'block';
        }
    }

    saveEdit() {
        const text = document.getElementById('editTodoInput').value.trim();
        const date = document.getElementById('editTodoDate').value;

        if (!text || !date) {
            alert('할 일과 날짜를 모두 입력해주세요.');
            return;
        }

        const todo = this.todos.find(todo => todo.id === this.editingTodoId);
        if (todo) {
            todo.text = text;
            todo.date = date;
            this.saveTodos();
            this.renderTodoList();
            this.renderCalendar();
        }

        this.closeModal();
    }

    closeModal() {
        document.getElementById('editModal').style.display = 'none';
        this.editingTodoId = null;
    }

    filterTodos(filter) {
        // 필터 버튼 활성화 상태 변경
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        this.renderTodoList(filter);
    }

    renderTodoList(filter = 'all') {
        const todoList = document.getElementById('todoList');
        let filteredTodos = [...this.todos];

        // 필터링
        const today = this.getKoreanDateString();
        switch (filter) {
            case 'today':
                filteredTodos = this.todos.filter(todo => todo.date === today);
                break;
            case 'upcoming':
                filteredTodos = this.todos.filter(todo => todo.date > today && !todo.completed);
                break;
            case 'completed':
                filteredTodos = this.todos.filter(todo => todo.completed);
                break;
        }

        // 날짜순 정렬
        filteredTodos.sort((a, b) => new Date(a.date) - new Date(b.date));

        todoList.innerHTML = '';

        if (filteredTodos.length === 0) {
            todoList.innerHTML = '<li class="todo-item empty-state">할 일이 없습니다.</li>';
            return;
        }

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            const date = new Date(todo.date + 'T00:00:00+09:00'); // 한국 시간대로 파싱
            const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

            li.innerHTML = `
                <div class="todo-content">
                    <div class="todo-info">
                        <div class="todo-text">${todo.text}</div>
                        <div class="todo-date">${formattedDate}</div>
                    </div>
                    <div class="todo-actions">
                        <button class="complete-btn" onclick="todoApp.toggleComplete(${todo.id})">
                            ${todo.completed ? '완료취소' : '완료'}
                        </button>
                        <button class="edit-btn" onclick="todoApp.editTodo(${todo.id})">수정</button>
                        <button class="delete-btn" onclick="todoApp.deleteTodo(${todo.id})">삭제</button>
                    </div>
                </div>
            `;
            
            todoList.appendChild(li);
        });
    }

    renderCalendar() {
        const currentMonthEl = document.getElementById('currentMonth');
        const calendarDaysEl = document.getElementById('calendarDays');
        
        const monthNames = [
            '1월', '2월', '3월', '4월', '5월', '6월',
            '7월', '8월', '9월', '10월', '11월', '12월'
        ];

        currentMonthEl.textContent = `${this.currentYear}년 ${monthNames[this.currentMonth]}`;

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        calendarDaysEl.innerHTML = '';

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';

            // 다른 달의 날짜인지 확인
            if (currentDate.getMonth() !== this.currentMonth) {
                dayEl.classList.add('other-month');
            }

            // 오늘 날짜인지 확인 (한국 시간 기준)
            const koreanToday = this.getKoreanDate();
            if (currentDate.toDateString() === koreanToday.toDateString()) {
                dayEl.classList.add('today');
            }

            const dateString = this.getKoreanDateString(currentDate);
            const dayTodos = this.todos.filter(todo => todo.date === dateString);

            dayEl.innerHTML = `
                <div class="calendar-day-number">${currentDate.getDate()}</div>
                <div class="calendar-todos">
                    ${dayTodos.map(todo => `
                        <div class="calendar-todo-item ${todo.completed ? 'completed' : ''}">
                            ${todo.text}
                        </div>
                    `).join('')}
                </div>
            `;

            calendarDaysEl.appendChild(dayEl);
        }
    }

    changeMonth(delta) {
        this.currentMonth += delta;
        
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }

        this.renderCalendar();
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}

// 애플리케이션 초기화
const todoApp = new TodoApp(); 