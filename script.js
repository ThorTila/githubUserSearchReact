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
              total: links.total
            }
          })
        }
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
      const totalPages = links.last.match(/page=(\d+).*$/)[1];
      links.total = Number(totalPages);
      return links;
    }

  render() {
    return (
      <div className='main'>
        <form onSubmit={event => this.onSubmit(event)}>
          <label htmlFor="searchText">Search by user name</label>
          <input type="text" id="searchText" onChange={event => this.onChangeHandle(event)} value={this.state.searchText}/> {/* ref */}
        </form>
        <UsersList users={this.state.users}/>
        <Pagination links={this.state.links} changePage={event => this.onSubmit(event)}/>
      </div>
    );
  }
}

class Pagination extends React.Component {
  render() {
    if (this.props.links.total) {
      return (
        <div className='pagination'>
            <PaginationList links={this.props.links} changePage={this.props.changePage}/>
        </div>
      )
    } else {
      return null;
    }
  }
}

class PaginationList extends React.Component {
  
  createList() {
    let linksList = [];
    if (this.props.links.prev) {
      linksList = [<li key={0}><a href={this.props.links.prev} onClick={this.props.changePage}>Previous</a></li>]
    }
    for (let i=1;i<=this.props.links.total;i++) {
      linksList = [...linksList,<li key={i}><a>{i}</a></li>];
    }
    let i = linksList.length;
    linksList = [...linksList, <li key={i + 1}><a href={this.props.links.next} onClick={this.props.changePage}>Next</a></li>]
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
        <img src={this.props.user.avatar_url} style={{maxWidth: '100px'}}/>
        <a href={this.props.user.html_url} target="_blank">{this.props.user.login}</a>
      </div>
    );
  }
}


ReactDOM.render(<App />, document.getElementById('root'));