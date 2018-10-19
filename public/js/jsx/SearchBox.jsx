class SearchBox extends React.Component {


    constructor(props) {
        super(props);
        this.state = {data: [], hashtag: [], user: []};
    }

    componentDidMount() {

        $('html').click(function () {
            this.setState({hashtag: []});
            this.setState({user: []});
        }.bind(this));
    }

    handleChange(event) {
        if (event.which == 13) {

            if (this.state.user.length == 1 && this.state.hashtag.length == 0) {

                username = this.state.user[0].name.replace(" ", ".");
                window.location = "/" + username;
            }
            if (this.state.user.length == 0 && this.state.hashtag.length == 1) {

                window.location = "/hash/" + this.state.hashtag[0].hashtag;
            }


        }
        if (event.target.value == "") {
            this.setState({hashtag: []});
            this.setState({user: []});
            return true;
        }
        this.serverRequest = $.get('/api/hashtags/' + event.target.value, function (data) {

            this.setState({hashtag: data});
        }.bind(this));

        this.serverRequest = $.get('/api/users/' + event.target.value, function (data) {

            this.setState({user: data});
        }.bind(this));
    }


    render() {

        return (

            <div className="form-group navbar-form navbar-left ">
                <input onKeyUp={this.handleChange} type="text" className="form-control" placeholder="#hash or @user"/>
                <ul className="searchresult">

                    {this.state.user.map(function (user, i) {
                        if (i > 4)
                            return true;
                        setting = JSON.parse(user.settings);
                        if (typeof(setting.profile_picture) != "undefined") {
                            img_src = upload_address + setting.profile_picture;
                        }
                        else {
                            img_src = '/public/img/no-profile.jpg';
                        }
                        user_href = "/" + user.name.replace(" ", ".");
                        return (
                            <li><a href={user_href}>{user.name} <img width="20" className="pull-right"
                                                                     src={img_src}/></a></li>
                        );
                    })}

                    {this.state.hashtag.map(function (item, i) {
                        if (i > 4)
                            return true;
                        hashtag_href = "/hash/" + item.hashtag;
                        return (
                            <li><a href={hashtag_href}>#{item.hashtag}</a></li>
                        );
                    })}


                </ul>
            </div>


        )
    }
}
