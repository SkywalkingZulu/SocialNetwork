class InitStream extends React.Component {

    constructor(props) {
        super(props);
        this.state = {data: [], random: false};
    }

    componentDidMount() {
        this.loadStreamFromServer();

        document.addEventListener('scroll', this.handleScroll);
        document.addEventListener('keydown', this.handleKeyDown);
        $("#next").on("click", this.randomPost);


        //@todo better soloution would be to save the complete data as state
        window.onpopstate = function (event) {
            window.location.href = event.state.url;
        };

    }

    handleKeyDown(event) {

        if (event.target.tagName == "BODY" && event.keyCode == 82) {
            this.randomPost();

        }
    }

    randomPost() {
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }


        this.setState({
            data: [],
            show: "random",

            endofData: true,
            id: getRandomInt(1, parseInt($(".stream-row").attr("data-maxid")) + 1)
        });

        this.loadStreamFromServer();

    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.handleScroll);
    }

    loadStreamFromServer() {

        var hash = "";
        var user = "";

        var show = 5;
        var lastid = "";


        if (this.id > 0 || typeof(id) == "undefined") {

            var ids = $(".stream-item").map(function () {
                return parseInt($(this).attr("data-id"), 10);
            }).get();

            this.setID(Math.min.apply(Math, ids));
        }


        if ($(".stream-row").attr("data-permalink") > 0) {

            this.setID(parseInt($(".stream-row").attr("data-permalink")) + 1);
            show = 1;
            this.setState({
                endofData: true,
            });
        }
        if ($(".stream-row").attr("data-hash") != "" && this.state.show != "random") {
            hash = $(".stream-row").attr("data-hash");
        }
        if ($(".stream-row").attr("data-user") != "" && this.state.show != "random") {
            user = $(".stream-row").attr("data-user");
        }


        if (this.state.show == "random") {
            show = 1;
            this.setID(this.state.id);
        }


        if (this.state.lastID == this.id) {

            this.setState({
                endofData: true,
            });
        }
        this.state.lastID = this.id;

        $(".spinner").show();
        $.ajax({
            url: '/api/content/?id=' + this.id + '&hash=' + hash + '&user=' + user + '&show=' + show,
            dataType: 'json',
            cache: false,
            success: function (data) {

                data = this.state.data.concat(data);

                if ($(".stream-row").attr("data-user") != "" && this.state.show != "random") {
                    $("#custom_css").html(data[0].author.custom_css);
                }

                this.setState({data: data});
                if (user_settings == false || user_settings.autoplay == "no") {
                    this.setAutoplayOff();
                }
                if (user_settings == false || user_settings.mute_video == "yes") {
                    this.setMuted();
                }
                if (this.state.show == "random") {
                    url = "/permalink/" + data[0].stream.id;
                    var stateObj = {id: data[0].stream.id, url: url};
                    history.pushState(stateObj, "irgendwas", url);


                }

                this.setState({
                    loadingFlag: false,
                });
                $(".spinner").hide();
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }

    render() {

        if (this.state.show == "random") {
            return (<div className="content">
                <StreamList data={this.state.data}/>
            </div>);
        }
        if (user_settings.show_nsfw == "false" && $(".stream-row").attr("data-hash") == "nsfw") {

            return (
                <div className="content">
                    You disabled not safe for work content
                </div>
            );
        }
        if (user_settings == false && $(".stream-row").attr("data-hash") == "nsfw") {
            return (
                <div className="content">
                    You need to be over +18 to watch nsfw content,
                    please <a href="/user/register/">register here.</a>
                </div>
            );
        }
        return (
            <div className="content">
                <StreamList data={this.state.data}/>
            </div>
        );
    }

    setAutoplayOff() {

        $('video').each(function (index) {
            $("video").get(index).pause();
        });
    }

    setMuted() {

        $("video").prop('muted', true);
    }

    setID(id) {
        this.id = id;
    }


    handleScroll(event) {

        if (this.state.endofData) {
            return true;
        }
        //this function will be triggered if user scrolls
        var windowHeight = $(window).height();
        var inHeight = window.innerHeight;
        var scrollT = $(window).scrollTop();
        var totalScrolled = scrollT + inHeight;
        if (totalScrolled + 100 > windowHeight) { //user reached at bottom
            if (!this.state.loadingFlag) { //to avoid multiple request
                this.setState({
                    loadingFlag: true,
                });

                this.loadStreamFromServer();
            }
        }

    }
}

var data = {}


ReactDOM.render(
    <InitStream data={data}/>,
    document.getElementsByClassName('stream')[0]
);
ReactDOM.render(
    <SearchBox data={data}/>,
    document.getElementById("SearchBox")
);
ReactDOM.render(
    <NotificationBox data={data}/>,
    document.getElementById("NotificationBox")
);
ReactDOM.render(
    <ChatBox data={data}/>,
    document.getElementById("ChatBox")
);
ReactDOM.render(
    <ShareBox data={data}/>,
    document.getElementById("ShareBox")
);
        

    
