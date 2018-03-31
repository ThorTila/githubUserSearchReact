"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App() {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this));

    _this.state = {
      searchText: '',
      users: [],
      links: {}
    };
    return _this;
  }

  _createClass(App, [{
    key: "onChangeHandle",
    value: function onChangeHandle(event) {
      this.setState({ searchText: event.target.value });
    }
  }, {
    key: "onSubmit",
    value: function onSubmit(event) {
      var _this2 = this;

      event.preventDefault();
      var searchText = this.state.searchText,
          url = event.currentTarget.href || "https://api.github.com/search/users?q=" + searchText;

      fetch(url).then(function (response) {
        var link = response.headers.get("link");
        if (link) {
          var links = _this2.parseLink(link);
          console.log(links);
          _this2.setState({
            links: {
              next: links.next,
              prev: links.prev,
              first: links.first,
              last: links.last,
              total: links.total,
              current: links.current
            }
          });
        } else {
          _this2.setState({
            links: {}
          });
        }
        console.log(_this2.state.links);
        return response;
      }).then(function (response) {
        return response.json();
      }).then(function (responseJson) {
        return _this2.setState({ users: responseJson.items });
      });
    }
  }, {
    key: "parseLink",
    value: function parseLink(link) {
      if (link === null) {
        throw new Error("link header is null");
      }
      var parts = link.split(',');
      var links = {};
      for (var i = 0; i < parts.length; i++) {
        var section = parts[i].split(';');
        if (section.length !== 2) {
          throw new Error("invalid data, no ';' in link header");
        }
        var url = section[0].replace(/<(.*)>/, '$1').trim(),
            name = section[1].replace(/rel="(.*)"/, '$1').trim();
        links[name] = url;
      }
      if (links.last) {
        var totalPages = links.last.match(/page=(\d+).*$/)[1];
        links.total = Number(totalPages);
      } else {
        var _totalPages = Number(links.prev.match(/page=(\d+).*$/)[1]) + 1;
        links.total = _totalPages;
      }
      if (links.next) {
        var currentPage = Number(links.next.match(/page=(\d+).*$/)[1]) - 1;
        links.current = currentPage;
      } else {
        var _currentPage = Number(links.prev.match(/page=(\d+).*$/)[1]) + 1;
        links.current = _currentPage;
      }
      return links;
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      return React.createElement(
        "div",
        { className: "main" },
        React.createElement(
          "form",
          { onSubmit: function onSubmit(event) {
              return _this3.onSubmit(event);
            } },
          React.createElement(
            "label",
            { htmlFor: "searchText" },
            "Search by user name"
          ),
          React.createElement("input", { type: "text", id: "searchText", onChange: function onChange(event) {
              return _this3.onChangeHandle(event);
            }, value: this.state.searchText })
        ),
        React.createElement(UsersList, { users: this.state.users }),
        React.createElement(Pagination, { links: this.state.links, searched: this.state.searchText, changePage: function changePage(event) {
            return _this3.onSubmit(event);
          } })
      );
    }
  }]);

  return App;
}(React.Component);

var Pagination = function (_React$Component2) {
  _inherits(Pagination, _React$Component2);

  function Pagination() {
    _classCallCheck(this, Pagination);

    return _possibleConstructorReturn(this, (Pagination.__proto__ || Object.getPrototypeOf(Pagination)).apply(this, arguments));
  }

  _createClass(Pagination, [{
    key: "render",
    value: function render() {
      if (this.props.links.total) {
        return React.createElement(
          "div",
          { className: "pagination" },
          React.createElement(PaginationList, { links: this.props.links, searched: this.props.searched, changePage: this.props.changePage })
        );
      } else {
        return null;
      }
    }
  }]);

  return Pagination;
}(React.Component);

var PaginationList = function (_React$Component3) {
  _inherits(PaginationList, _React$Component3);

  function PaginationList() {
    _classCallCheck(this, PaginationList);

    return _possibleConstructorReturn(this, (PaginationList.__proto__ || Object.getPrototypeOf(PaginationList)).apply(this, arguments));
  }

  _createClass(PaginationList, [{
    key: "createList",
    value: function createList() {
      var linksList = [],
          url = "https://api.github.com/search/users?q=" + this.props.searched + "&page=";
      if (this.props.links.first) {
        linksList = [React.createElement(
          "li",
          { key: -1 },
          React.createElement(
            "a",
            { href: this.props.links.first, onClick: this.props.changePage },
            "First"
          )
        ), React.createElement(
          "li",
          { key: 0 },
          React.createElement(
            "a",
            { href: this.props.links.prev, onClick: this.props.changePage },
            "Previous"
          )
        )];
      }
      for (var i = 1; i <= this.props.links.total; i++) {
        linksList = [].concat(_toConsumableArray(linksList), [React.createElement(
          "li",
          { key: i },
          React.createElement(
            "a",
            { href: url + i, className: this.props.links.current === i ? 'active' : '', onClick: this.props.changePage },
            i
          )
        )]);
      }
      if (this.props.links.last) {
        var _i = linksList.length;
        linksList = [].concat(_toConsumableArray(linksList), [React.createElement(
          "li",
          { key: _i + 1 },
          React.createElement(
            "a",
            { href: this.props.links.next, onClick: this.props.changePage },
            "Next"
          )
        ), React.createElement(
          "li",
          { key: _i + 2 },
          React.createElement(
            "a",
            { href: this.props.links.last, onClick: this.props.changePage },
            "Last"
          )
        )]);
      }
      if (linksList.length < 2) {
        return null;
      } else {
        return linksList;
      }
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(
        "ul",
        null,
        this.createList()
      );
    }
  }]);

  return PaginationList;
}(React.Component);

var UsersList = function (_React$Component4) {
  _inherits(UsersList, _React$Component4);

  function UsersList() {
    _classCallCheck(this, UsersList);

    return _possibleConstructorReturn(this, (UsersList.__proto__ || Object.getPrototypeOf(UsersList)).apply(this, arguments));
  }

  _createClass(UsersList, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { className: "users-list" },
        this.users
      );
    }
  }, {
    key: "users",
    get: function get() {
      return this.props.users.map(function (user) {
        return React.createElement(User, { key: user.id, user: user });
      });
    }
  }]);

  return UsersList;
}(React.Component);

var User = function (_React$Component5) {
  _inherits(User, _React$Component5);

  function User() {
    _classCallCheck(this, User);

    return _possibleConstructorReturn(this, (User.__proto__ || Object.getPrototypeOf(User)).apply(this, arguments));
  }

  _createClass(User, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { className: "user" },
        React.createElement(
          "a",
          { href: this.props.user.html_url, target: "_blank" },
          React.createElement("img", { src: this.props.user.avatar_url, style: { maxWidth: '100px' } })
        ),
        React.createElement(
          "a",
          { href: this.props.user.html_url, target: "_blank" },
          this.props.user.login
        )
      );
    }
  }]);

  return User;
}(React.Component);

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
