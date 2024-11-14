/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable max-len */
/* eslint-disable padding-line-between-statements */
/* eslint-disable @typescript-eslint/semi */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { addTodo, deleteTodo, getTodos, updateTodo, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import { TodoList } from './components/TodoList';

export const App: React.FC = () => {

  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<number[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState('');

  function handleNewTodoTitle(e: React.ChangeEvent<HTMLInputElement>) {
    setNewTodoTitle(e.target.value);
  }

  async function handleAddNewTodo (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newTodoIdAvailable = todos.length ? todos[todos.length - 1].id + 1 : 1;
    try {
      if (!newTodoTitle) {
        setError('Title should not be empty');
        return;
      }
      setEditingTodoId([...editingTodoId, newTodoIdAvailable]);
      const newTodo:Todo = {
        id: newTodoIdAvailable, title: newTodoTitle, completed: false,
        userId: USER_ID,
      }
      setFilteredTodos([...todos, newTodo]);
      const newTodoFromServer = await addTodo(newTodoTitle);
      const newTodos = todos.map((t) => (t.id === newTodoIdAvailable ? newTodoFromServer : t));
      const newFilteredTodos = filteredTodos.map((t) => (t.id === newTodoIdAvailable ? newTodoFromServer : t));
      setTodos(newTodos);
      setFilteredTodos(newFilteredTodos);
      setNewTodoTitle('');
    } catch (e) {
      setError('Unable to add a todo');
      setEditingTodoId(editingTodoId.filter((id) => id !== newTodoIdAvailable));
      setFilteredTodos(filteredTodos.filter((t) => t.id !== newTodoIdAvailable));
  }

}

  async function loadAllTodos() {
    try {
      const loadedTodos = await getTodos();
      setTodos(loadedTodos);
      setFilteredTodos(loadedTodos);
    } catch (e) {
      setError('Unable to load todos');
    }

  }

  async function handleEditTitleOfTodo(todo: Todo) {
    try {
      if(!selectedTodo) {
        throw new Error('Unable to update todo');
      }

      setEditingTodoId([...editingTodoId, todo.id]);
      const updatedTodoFromServer = await updateTodo({
        ...todo,
        title: selectedTodo.title,
      })
      const newTodos = todos.map((t) => (t.id === todo.id ? updatedTodoFromServer : t));
      setTodos(newTodos);
      setFilteredTodos(newTodos);
      setEditingTodoId(editingTodoId.filter((id) => id !== todo.id));
    } catch (e) {
      setError('Unable to update a todo');
      setEditingTodoId(editingTodoId.filter((id) => id !== todo.id));
  }
}

  function handleSelectedTodoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedTodo) {
      return;
    }
    setSelectedTodo({
      ...selectedTodo,
      title: e.target.value,
    });
  }


  async function handleUpdateTodoStatus(todoId: number) {
    try {
      const todo = todos.find((t) => t.id === todoId);
      setEditingTodoId([...editingTodoId, todoId]);
      if (!todo) {
        throw new Error('Todo not found');
      }
      const updatedTodo: Todo = { ...todo, completed: !todo.completed };
      const updatedTodoFromServer = await updateTodo(updatedTodo);
      const newTodos = todos.map((t) => (t.id === todoId ? updatedTodoFromServer : t));
      setEditingTodoId(editingTodoId.filter((id) => id !== todoId));
      setTodos(newTodos);
      setFilteredTodos(newTodos);


    } catch (e) {
      setError('Unable to update a todo');
      setEditingTodoId(editingTodoId.filter((id) => id !== todoId));
    }
  }
  async function handleRemoveTodo(todoId: number) {
    try {
      setEditingTodoId([...editingTodoId, todoId]);
      await deleteTodo(todoId);
      setEditingTodoId(editingTodoId.filter((id) => id !== todoId));
      loadAllTodos();
    } catch (e) {
      setError('Unable to delete a todo');
      setEditingTodoId(editingTodoId.filter((id) => id !== todoId));
    }
  }

  async function handleSubmitForm(e: React.FormEvent<HTMLFormElement>, todo: Todo) {
    e.preventDefault();
    if (!selectedTodo) {
      return;
    }

    if (selectedTodo && !selectedTodo.title) {
      await  handleRemoveTodo(todo.id);
       setSelectedTodo(null);
       return;
     } else if (selectedTodo.title === todo.title) {
       setSelectedTodo(null);
       return ;
     } else if (selectedTodo.title !== todo.title) {
     await handleEditTitleOfTodo(selectedTodo);
      setSelectedTodo(null);
      return;
     }
  }

  useEffect(() => {
    loadAllTodos();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setError(null)
    }, 3000)
  }, [error])

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={(e)=> handleAddNewTodo(e)}>
            <input
              data-cy="NewTodoField"
              type="text"
              onChange={(e)=> handleNewTodoTitle(e)}
              className="todoapp__new-todo"
              value={newTodoTitle}
              placeholder="What needs to be done?"
            />
          </form>
        </header>

        <TodoList
          filteredTodos={filteredTodos}
          handleUpdateTodoStatus={handleUpdateTodoStatus}
          handleRemoveTodo={handleRemoveTodo}
          handleSelectedTodoChange={handleSelectedTodoChange}
          handleSubmitForm={handleSubmitForm}
          editingTodoId={editingTodoId}
          selectedTodo={selectedTodo}
          setSelectedTodo={setSelectedTodo}
        />

        {/* Hide the footer if there are no todos */}
        <footer className="todoapp__footer" data-cy="Footer">
          <span className="todo-count" data-cy="TodosCounter">
            3 items left
          </span>

          {/* Active link should have the 'selected' class */}
          <nav className="filter" data-cy="Filter">
            <a
              href="#/"
              className="filter__link selected"
              data-cy="FilterLinkAll"
            >
              All
            </a>

            <a
              href="#/active"
              className="filter__link"
              data-cy="FilterLinkActive"
            >
              Active
            </a>

            <a
              href="#/completed"
              className="filter__link"
              data-cy="FilterLinkCompleted"
            >
              Completed
            </a>
          </nav>

          {/* this button should be disabled if there are no completed todos */}
          <button
            type="button"
            className="todoapp__clear-completed"
            data-cy="ClearCompletedButton"
          >
            Clear completed
          </button>
        </footer>
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy={`ErrorNotification ${error ? '' : 'hidden'}`}
        className="notification is-danger is-light has-text-weight-normal"
      >
        <button data-cy="HideErrorButton" type="button" className="delete" />
        {/* show only one message at a time */}
        {error}
       {/*  Unable to load todos
        <br />
        Title should not be empty
        <br />
        Unable to add a todo
        <br />
        Unable to delete a todo
        <br />
        Unable to update a todo */}
      </div>
    </div>
  );
};
