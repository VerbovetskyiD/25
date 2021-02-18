class ToDoList {
  constructor(listName) {
    this._init(listName);
  }

  async add(text, priority = 1) {
    try {
      const task = {
        value: text,
        priority: priority,
      };

      const request = await this._createRequest(
        'POST',
        task,
        this._authorization,
      );

      this._storage.push(
        await this._getJSON('https://todo.hillel.it/todo', request),
      );
    } catch (err) {
      console.error(err);
    }
  }

  async edit(id, text, priority = 1) {
    try {
      const index = this._findIndex(id);
      if (index !== -1) {
        const task = {
          value: text,
          priority: priority,
        };

        const request = await this._createRequest(
          'PUT',
          task,
          this._authorization,
        );

        await this._getJSON('https://todo.hillel.it/todo', request, id);
        this._storage[index] = await this._getTask(id);
      } else {
        throw new Error('False index');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async complete(id) {
    try {
      const index = this._findIndex(id);
      if (index !== -1) {
        const request = await this._createRequest(
          'PUT',
          null,
          this._authorization,
        );

        await this._getJSON('https://todo.hillel.it/todo', request, id, true);
        this._storage[index] = await this._getTask(id);
      } else {
        throw new Error('False index');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async delete(id) {
    try {
      const index = this._findIndex(id);
      if (index !== -1) {
        const request = await this._createRequest(
          'DELETE',
          null,
          this._authorization,
        );

        await this._getJSON('https://todo.hillel.it/todo', request, id);
        this._storage.splice(index, 1);
      } else {
        throw new Error('False index');
      }
    } catch (err) {
      console.error(err);
    }
  }

  stat() {
    return this._storage.reduce(
      (stat, task) => {
        if (task.checked) {
          stat.completed.total++;
          stat.completed.tasks.push(task);
        } else {
          stat.uncompleted.total++;
          stat.uncompleted.tasks.push(task);
        }
        return stat;
      },
      {
        completed: {
          total: 0,
          tasks: [],
        },
        uncompleted: {
          total: 0,
          tasks: [],
        },
      },
    );
  }

  async _init(listName) {
    this.name = {
      value: listName,
    };
    this._token = (await this._getToken()).access_token;
    this._authorization = {
      Authorization: 'Bearer ' + this._token,
    };
    this._storage = await this._getList();
  }

  async _getToken() {
    return await this._getJSON(
      'https://todo.hillel.it/auth/login',
      this._createRequest('POST', this.name),
    );
  }

  _createRequest(method, data, headers) {
    if (!data && !headers) {
      return {
        method: method,
        headers: {
          'content-type': 'application/json',
        },
      };
    } else if (!data) {
      return {
        method: method,
        headers: {
          'content-type': 'application/json',
          ...headers,
        },
      };
    } else if (!headers) {
      return {
        method: method,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(data),
      };
    } else {
      return {
        method: method,
        headers: {
          'content-type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(data),
      };
    }
  }

  async _getJSON(url, request, id = null, toggle = false) {
    return await fetch(
      id === null
        ? url
        : toggle === false
        ? url + `/${id}`
        : url + `/${id}/toggle`,
      request,
    ).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Status: ${response.status}`);
      }
    });
  }

  async _getList() {
    const listRequest = this._createRequest('GET', null, this._authorization);
    return await this._getJSON('https://todo.hillel.it/todo', listRequest);
  }

  async _getTask(id) {
    const request = this._createRequest('GET', null, this._authorization);
    return await this._getJSON('https://todo.hillel.it/todo', request, id);
  }

  _findIndex(id) {
    return this._storage.findIndex(task => task._id === id);
  }
}

//для проверки
const toDoList = new ToDoList('MyName');
// toDoList.add();
// toDoList.edit();
// toDoList.complete();
// toDoList.delete();
// toDoList.stat();
