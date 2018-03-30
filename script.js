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
      const {searchText} = this.state;
      const url = `https://api.github.com/search/users?q=${searchText}`;
      fetch(url)
        .then(response => {
          const link = response.headers.get("link"),
            links = this.parseLink(link);
            this.setState({
              links: {
                linkNext: links.next,
                linkLast: links.last,
                totalLinks: links.total
              }
            })
            console.log(this.state.links);
          return response;
        })
        .then(response => response.json())
        .then(responseJson => this.setState({users: responseJson.items}));
    }

    parseLink(link) {
      if (link.length === 0) {
        throw new Error("link header is zero length");
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
            <input
              type="text"
              id="searchText"
              onChange={event => this.onChangeHandle(event)}
              value={this.state.searchText}/> {/* ref */}
          </form>
          <UsersList users={this.state.users}/>
        </div>
      );
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