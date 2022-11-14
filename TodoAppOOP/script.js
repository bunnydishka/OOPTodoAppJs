let DO = "DO";
const todoListInp = document.getElementById("todo-list");

class TodoList {
  constructor(id, head = "") {
    this.head = head;
    this.id = id;
  }
}
class DOM {
  _manager;
  constructor(manager) {
    this._manager = manager;
    this.Initial();
  }

  Initial() {

    this.sort = true;
    this.todoListArea = this.getElementBySelector("#todo-list");
    this.insertBtn = this.getElementBySelector("#add-btn");
    this.sorting = this.getElementBySelector("#sort-btn");
    this.insertBtn.addEventListener("click", (_) => this.customAdd());
    this.sorting.addEventListener("click", (_) => this.customSort());
    this._manager.changeEvent.subscribe(() => this.displayTodos());
    this.displayTodos();
  }

  displayTodos() {
    const todos = this._manager.getTodos();
    const values = todos.map((v) => {
     let item = this.createTodo(v)
      const delBtn = document.createElement("button");
      delBtn.classList.add("del-btn");
      delBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" stroke="#C4C4C4"/>
            <path d="M6 6L14 14" stroke="#C4C4C4"/>
            <path d="M6 14L14 6" stroke="#C4C4C4"/>
            </svg>
            `;
      delBtn.addEventListener("click", (_) => this.customDelete(v.id));
      item.append(delBtn);
      return item;
    });

    this.todoListArea.innerHTML = "";
    this.todoListArea.append(...values);
  }

  createTodo(v){
    const item = document.createElement("li");
    const todoInput = document.createElement("input");
    todoInput.value = v.head;
    todoInput.addEventListener("change", (e) =>
      this.customEdit(v.id, e.target.value)
    );
    item.append(todoInput);
    return item;
  }
  customAdd() {
    try {
      this._manager.addTodo();
    } catch (error) {
      this.ThrowError(error.message);
    }
  }

  customEdit(id, head) {
    try {
      this._manager.editTodo(id, head);
    } catch (error) {
      this.ThrowError(error.message);
    }
  }


  customDelete(id) {
    this._manager.deleteTodo(id);
  }

  customSort() {
    this._manager.sortTodos(this.sort);
    this.sort = !this.sort;

    if (this.sort) {
      this.sorting.innerHTML = `<svg width="25" height="15" viewBox="0 0 25 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2.5" width="2.5" height="12.5" fill="#C4C4C4"/>
            <rect x="10" y="3.75" width="2.5" height="7.5" transform="rotate(-90 10 3.75)" fill="#C4C4C4"/>
            <rect x="10" y="8.75" width="2.5" height="10" transform="rotate(-90 10 8.75)" fill="#C4C4C4"/>
            <rect x="10" y="13.75" width="2.5" height="15" transform="rotate(-90 10 13.75)" fill="#C4C4C4"/>
            <path d="M3.75 15L0.502405 10.3125L6.9976 10.3125L3.75 15Z" fill="#C4C4C4"/>
            </svg>
            `;
    } else {
      this.sorting.innerHTML = `<svg width="25" height="15" viewBox="0 0 25 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="15" width="2.5" height="12.5" transform="rotate(-180 5 15)" fill="#C4C4C4"/>
            <rect x="10" y="3.75" width="2.5" height="7.5" transform="rotate(-90 10 3.75)" fill="#C4C4C4"/>
            <rect x="10" y="8.75" width="2.5" height="10" transform="rotate(-90 10 8.75)" fill="#C4C4C4"/>
            <rect x="10" y="13.75" width="2.5" height="15" transform="rotate(-90 10 13.75)" fill="#C4C4C4"/>
            <path d="M3.75 6.55671e-07L6.99759 4.6875L0.502404 4.6875L3.75 6.55671e-07Z" fill="#C4C4C4"/>
            </svg>
            `;
    }
  }


  getElementBySelector(selector) {
   return document.querySelector(selector);
  }

  ThrowError(message) {

    const alert = this.getElementBySelector('#alert');
    this.getElementBySelector('#alert span').textContent = message;
    alert.style.display = 'block';
    this.displayTodos();
  }
  
}
class TodoService {
  todoService;

  constructor(todos = []) {
    this.Initial();
    this.changeEvent = new ChangeEvent();
    if (!this.todoService?.length) {
      this.todoService = todos;
      this.SaveChanges();
    }
  }

  setTodos(todos) {
    debugger
    this.todoService = todos;
    this.SaveChanges();
  }

 
  getTodos() {
    return [...this.todoService];
  }

  addTodo(head = "") {
  
    if (!this.todoService.some((todo) => !todo.head)) {
      this.setTodos([...this.todoService, new TodoList(this.guid(), head)]);
    } else {
      throw new Error("There is empty element in todo list");
    }
  }


  editTodo(id, head) {
    if (!head.trim()) throw new Error("You can not empty head.");
    const todos = [...this.todoService];
    todos[this.getIndex(id)].head = head.trim();
    this.setTodos(todos);
  }


  deleteTodo(id) {
    this.setTodos(this.todoService.filter((t) => t.id !== id));
  }
  sortTodos(direction = true) {
    const todos = [...this.todoService]
      .filter((t) => t.head)
      .sort((t1, t2) =>
        t1.head.toUpperCase() > t2.head.toUpperCase() ? 1 : -1
      );
    if (!direction) todos.reverse();
    this.setTodos(todos);
  }


  Initial() {
    this.todoService = JSON.parse(localStorage.getItem(DO) || "[]");
  }


  SaveChanges() {
    localStorage.setItem(DO, JSON.stringify(this.todoService));
    this.changeEvent.get();
  }

  guid() {
    return this.todoService?.length
      ? [...this.todoService].sort((t1, t2) => t2.id - t1.id)[0].id + 1
      : 1;
  }


  getIndex(id) {
    const index = this.todoService.findIndex((t) => t.id === id);

    if (index !== -1) {
      return index;
    }

    throw new Error(`There are no such todo with ${id} id.`);
  }
}
class ChangeEvent {
  constructor() {
    this.Eventlisteners = [];
  }

  subscribe(...Eventlisteners) {
    this.Eventlisteners = [...this.Eventlisteners, ...Eventlisteners];
  }
  
  get(data) {
    this.Eventlisteners .forEach((listener) => listener(data));
  }
}


const dom = new DOM(new TodoService([{ id: 1, head: "" }]));