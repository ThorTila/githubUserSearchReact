class App extends React.Component {
  constructor() {
    super();
    this.state = {
      searchText: '',
      users: [],
      links: {}
    };
  }

  onChangeHandle(event) {
    this.setState({searchText: event.target.value});
  }

  onSubmit(event) {
    event.preventDefault();
    const {searchText} = this.state,
      url = event.currentTarget.href || `https://api.github.com/search/users?q=${searchText}`;
    fetch(url)
      .then(response => {
        const link = response.headers.get("link");
        if (link) {
          const links = this.parseLink(link);
          console.log(links);
          this.setState({
            links: {
              next: links.next,
              prev: links.prev,
              first: links.first,
              last: links.last,
              total: links.total,
              current: links.current
            }
          })
        } else {
          this.setState ({
            links: {}
          })
        }
        console.log(this.state.links);
        return response;
      })
      .then(response => response.json())
      .then(responseJson => this.setState({users: responseJson.items}));
  }

  parseLink(link) {
    if (link === null) {
      throw new Error("link header is null");
    }
    const parts = link.split(',');
    let links = {};
    for(let i=0; i < parts.length; i++) {
      const section = parts[i].split(';');
      if (section.length !== 2) {
          throw new Error("invalid data, no ';' in link header");
        }
        const url = section[0].replace(/<(.*)>/, '$1').trim(),
          name = section[1].replace(/rel="(.*)"/, '$1').trim();
        links[name] = url;
      }
      if (links.last) {
        const totalPages = links.last.match(/page=(\d+).*$/)[1];
        links.total = Number(totalPages);
      } else {
        const totalPages = Number(links.prev.match(/page=(\d+).*$/)[1]) + 1;
        links.total = totalPages;
      }
      if (links.next) {
        const currentPage = Number(links.next.match(/page=(\d+).*$/)[1]) - 1;
        links.current = currentPage;
      } else {
        const currentPage = Number(links.prev.match(/page=(\d+).*$/)[1]) + 1;
        links.current = currentPage;
      }
      return links;
    }

  render() {
    return (
      <div className='main'>

        <form onSubmit={event => this.onSubmit(event)}>
          <label htmlFor="searchText">Search by user name</label>
          <input type="text" id="searchText" onChange={event => this.onChangeHandle(event)} value={this.state.searchText}/>
        </form>

        <UsersList users={this.state.users}/>

        <Pagination links={this.state.links} searched={this.state.searchText} changePage={event => this.onSubmit(event)}/>

      </div>
    );
  }
}

class Pagination extends React.Component {
  render() {
    if (this.props.links.total) {
      return (
        <div className='pagination'>
            <PaginationList links={this.props.links} searched={this.props.searched} changePage={this.props.changePage}/>
        </div>
      )
    } else {
      return null;
    }
  }
}

class PaginationList extends React.Component {

  createList() {
    let linksList = [],
      url = `https://api.github.com/search/users?q=${this.props.searched}&page=`;
    if (this.props.links.first) {
      linksList = [
        <li key={-1}>
          <a href={this.props.links.first} onClick={this.props.changePage}>First</a>
        </li>,
        <li key={0}>
          <a href={this.props.links.prev} onClick={this.props.changePage}>Previous</a>
        </li>
      ];
    }
    for (let i=1;i<=this.props.links.total;i++) {
      linksList = [...linksList,<li key={i}><a href={url + i} className={(this.props.links.current === i) ? 'active' : ''} onClick={this.props.changePage}>{i}</a></li>];
    }
    if (this.props.links.last) {
      let i = linksList.length;
      linksList = [...linksList,
        <li key={i + 1}>
          <a href={this.props.links.next} onClick={this.props.changePage}>Next</a>
        </li>,
        <li key={i + 2}>
          <a href={this.props.links.last} onClick={this.props.changePage}>Last</a>
        </li>
      ];
    }
    if (linksList.length < 2) {
      return null;
    } else {
      return linksList;
    }
  }

  render() {
    return (
      <ul>
        {this.createList()}
      </ul>
    )
  }
}
  
class UsersList extends React.Component {
  get users() {
    return this.props.users.map(user => <User key={user.id} user={user}/>);
  }

  render() {
    return (
      <div className='users-list'>
        {this.users}
      </div>
    );
  }
}

class User extends React.Component {
  render() {
    return (
      <div className='user'>
        <a href={this.props.user.html_url} target="_blank">
          <img src={this.props.user.avatar_url} style={{maxWidth: '100px'}}/>
        </a>
        <a href={this.props.user.html_url} target="_blank">{this.props.user.login}</a>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));