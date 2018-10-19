class NotificationBox extends React.Component {


    constructor(props) {
        super(props);
        this.state = {data: [], init: true};
    }


    componentDidMount() {

        var socket;
        try {
            socket = new WebSocket(notification_server);

            socket.onopen = function (msg) {

                socket.send(JSON.stringify({action: "getNotifications", auth_cookie: getCookie("auth")}));
            };
            socket.onmessage = function (msg) {

                data = JSON.parse(msg.data);

                if (typeof data.notificaton != "undefined") {

                    //play only sound on new notifications
                    if (this.state.init === false)
                        new Audio('/public/notification.mp3').play();
                    if (data.notificaton.length > 0)
                        document.getElementById("NotificationBox").className = "";

                    this.setState({
                        data: data.notificaton,
                        init: false
                    });
                }
                if (typeof data.reauth != "undefined") {
                    //looks like our auth token is invalid, lets try to reauth
                    renew_auth_token();

                }


            }.bind(this);
            socket.onclose = function (msg) {
                document.getElementById("NotificationBox").style.display = "none";
            };
        }
        catch (ex) {

            console.log(ex);
        }

    }


    render() {

        var li = [];
        for (notification in this.state.data) {

            notification = this.state.data[notification];

            if (typeof JSON.parse(notification.settings).profile_picture !== "undefined") {
                var img_src = upload_address + JSON.parse(notification.settings).profile_picture;
                profile_pic = <img src={img_src}/>;
            }
            else
                profile_pic = <img src="/public/img/no-profile.jpg"/>;

            safe_username = "/" + notification.name.replace(" ", ".")
            user_link_pic = <a href={safe_username}>{profile_pic}</a>;
            user_link = <a href={safe_username}>{notification.name}</a>;


            li.push(<p>{user_link_pic} {user_link} <span dangerouslySetInnerHTML={{__html: notification.message}}/>
            </p>);

        }
        return (
            <div ref="notification">{li}</div>
        )
    }
}
