function getTemplateElement(id) {
	const template = document.getElementById(id);
	if (!template) return;
	const elementContent = template.content;

	if (!elementContent) return;

	return document.importNode(elementContent, true).firstElementChild;
}

function LocalStorageStateManager() {
	this.appKey = "~~todo_app-";

	this.reset = function () {
		localStorage.setItem(this.appKey, "[]");
	};

	if (!localStorage.getItem(this.appKey)) {
		this.reset();
	}

	this.getAllItems = function () {
		return JSON.parse(localStorage.getItem(this.appKey));
	};

	this.removeItem = function (id) {
		const items = this.getAllItems();

		if (items.length === 0) return;

		const index = items.findIndex((todo) => todo.id === id);

		if (index !== -1) {
			items.splice(index, 1);
		}

		localStorage.setItem(this.appKey, JSON.stringify(items));
	};

	this.addItem = function (todo) {
		const items = this.getAllItems();

		items.push(todo);

		localStorage.setItem(this.appKey, JSON.stringify(items));
	};

	this.completeItem = function (id) {
		const items = this.getAllItems();
		const todoItem = items.find((todo) => todo.id === id);

		if (!todoItem) return;

		todoItem.isDone = true;

		localStorage.setItem(this.appKey, JSON.stringify(items));

		return todoItem;
	};
}

function ToDo(title, description) {
	this.id = crypto.randomUUID();
	this.title = title;
	this.description = description;
	this.isDone = false;
}

function UncompletedToDoList(state, completedTodoList) {
	this.root = document.getElementById("uncompleted-todos");
	this.completedTodoList = completedTodoList;
	this.state = state;

	this.addItem = function (title, description) {
		const todo = new ToDo(title, description);

		this.state.addItem(todo);

		this.render(todo);
	};

	this.completeItem = function (id) {
		const completedTodo = this.state.completeItem(id);

		this.completedTodoList.render(completedTodo);

		const todoElement = document.getElementById(id);

		if (todoElement) {
			todoElement.remove();
		}
	};
	this.completeItem = this.completeItem.bind(this);

	this.getTemplate = function () {
		return getTemplateElement("uncompleted_todo_template");
	};

	this.congifurateTemplate = function (template, todo) {
		template.id = todo.id;
		template.querySelector(".title").textContent = todo.title;
		template.querySelector(".description").textContent = todo.description;

		template
			.querySelector(".complete")
			.addEventListener("click", () => this.completeItem(todo.id));
	};

	this.render = function (todo) {
		const template = this.getTemplate();
		this.congifurateTemplate(template, todo);

		this.root.insertAdjacentElement("beforeend", template);
	};

	this.initialize = function () {
		const items = this.state.getAllItems().filter((todo) => {
			return !todo.isDone;
		});
		// items.forEach((item) => this.render(item));

		for (const item of items) {
			this.render(item);
		}
	};
}

function CompletedToDoList(state) {
	this.root = document.getElementById("completed-todos");
	this.state = state;

	this.removeItem = function (id) {
		this.state.removeItem(id);

		const todoElement = document.getElementById(id);

		if (todoElement) {
			todoElement.remove();
		}
	};
	this.removeItem = this.removeItem.bind(this);

	this.getTemplate = function () {
		return getTemplateElement("completed_todo_template");
	};

	this.congifurateTemplate = function (template, todo) {
		template.id = todo.id;
		template.querySelector(".title").textContent = todo.title;
		template.querySelector(".description").textContent = todo.description;

		template
			.querySelector(".remove")
			.addEventListener("click", () => this.removeItem(todo.id));
	};

	this.render = function (todo) {
		const template = this.getTemplate();
		this.congifurateTemplate(template, todo);

		this.root.insertAdjacentElement("beforeend", template);
	};

	this.initialize = function () {
		const items = this.state.getAllItems().filter((todo) => todo.isDone);

		// items.forEach((item) => this.render(item));

		for (const item of items) {
			this.render(item);
		}
	};
}

function CreateToDoForm() {
	this.submitHandler = null;

	this.submitForm = function (e) {
		e.preventDefault();

		const title = document.getElementById("form_title").value;
		const description = document.getElementById("form_description").value;

		if (title) {
			this.submitHandler(title, description);

			this.clearForm();
		}
	};

	this.addSubmitHandler = function (submitHandler) {
		this.submitHandler = submitHandler;
	};

	this.initialize = function () {
		const form = document.getElementById("add_todo_form");

		if (form) {
			form.addEventListener("submit", this.submitForm.bind(this));
		}
	};

	this.clearForm = function () {
		document.getElementById("form_title").value = "";
		document.getElementById("form_description").value = "";
	};
}

function app() {
	const state = new LocalStorageStateManager();
	const completedTodoList = new CompletedToDoList(state);
	const uncompletedTodoList = new UncompletedToDoList(state, completedTodoList);
	completedTodoList.initialize();
	uncompletedTodoList.initialize();

	const createTodoForm = new CreateToDoForm();

	createTodoForm.initialize();
	createTodoForm.addSubmitHandler(
		uncompletedTodoList.addItem.bind(uncompletedTodoList)
	);
}

document.addEventListener("DOMContentLoaded", app);
