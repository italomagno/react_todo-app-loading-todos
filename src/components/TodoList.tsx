/* eslint-disable max-len */
/* eslint-disable padding-line-between-statements */
/* eslint-disable @typescript-eslint/semi */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */

import React from 'react';
import { Todo } from '../types/Todo';
import { CSSTransition, TransitionGroup } from 'react-transition-group';



interface TodoListProps {
  filteredTodos: Todo[];
  handleUpdateTodoStatus: (id: number) => void;
  handleRemoveTodo: (id: number) => void;
  handleSelectedTodoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmitForm: (e: React.FormEvent<HTMLFormElement>, todo: Todo) => void;
  editingTodoId:  number[];
  selectedTodo: Todo | null;
  setSelectedTodo: (todo: Todo | null) => void;
}
export function TodoList({
   filteredTodos,
    handleUpdateTodoStatus,
    handleRemoveTodo,
    handleSelectedTodoChange,
    handleSubmitForm,
    editingTodoId,
    selectedTodo,
    setSelectedTodo,
  }: TodoListProps) {

  return (
    <TransitionGroup component={null}>
      {
        filteredTodos.map((todo) => (
          <CSSTransition
          key={todo.id}
          timeout={300}
          classNames="item"
          unmountOnExit
          appear
          enter
          exit
        >
          <div data-cy="Todo" className={`todo ${todo.completed ? 'completed' : ''}`}>
            <label className="todo__status-label">
              <input
                data-cy="TodoStatus"
                type="checkbox"
                className="todo__status"
                checked={todo.completed}
                onClick={() => handleUpdateTodoStatus(todo.id)}
              />
            </label>

            {
              !selectedTodo
                ? <span onDoubleClick={() => setSelectedTodo(todo)} data-cy="TodoTitle" className="todo__title">
                  {todo.title}
                </span>
                : <form onSubmit={(e) => handleSubmitForm(e, todo)}>
                  <input
                    data-cy="TodoTitleField"
                    type="text"
                    className="todo__title-field"
                    onChange={handleSelectedTodoChange}
                    placeholder="Empty todo will be deleted"
                    onBlur={(e) => handleSubmitForm(e as unknown as React.FormEvent<HTMLFormElement>, todo)}
                    value={selectedTodo.title}
                  />
                </form>
            }


            {/* Remove button appears only on hover */}
            <button onClick={() => handleRemoveTodo(todo.id)} type="button" className="todo__remove" data-cy="TodoDelete">
              ×
            </button>

            {/* overlay will cover the todo while it is being deleted or updated */}
            <div data-cy="TodoLoader" className={`modal overlay ${editingTodoId.includes(todo.id) ? "is-active" : ''}`}>
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div>
          </CSSTransition>

        ))
      }
</TransitionGroup>

  )

};
