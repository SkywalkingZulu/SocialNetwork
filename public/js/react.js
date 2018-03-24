
var Author = React.createClass({
    displayName: "Author",


    render: function () {

        var imgpath = this.props.author.profile_picture;
        if (typeof this.props.author.profile_picture == "undefined") {
            imgpath = "/public/img/default-profile.png";
        }
        var editBtn;
        if (this.props.id == user_id) {
            editBtn = React.createElement(
                "div",
                { className: "dropdown pull-right" },
                React.createElement(
                    "button",
                    { className: "btn btn-default dropdown-toggle", type: "button", id: "dropdownMenu1", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "true" },
                    React.createElement("span", { className: "caret" })
                ),
                React.createElement(
                    "ul",
                    { className: "dropdown-menu" },
                    React.createElement(
                        "li",
                        null,
                        React.createElement(
                            "a",
                            { href: "#", onClick: this.props.editContent },
                            "Edit"
                        )
                    ),
                    React.createElement(
                        "li",
                        null,
                        React.createElement(
                            "a",
                            { href: "#", onClick: this.props.deleteContent },
                            "Delete"
                        )
                    ),
                    React.createElement(
                        "li",
                        null,
                        React.createElement(
                            "a",
                            { href: "#", onClick: this.props.reportContent },
                            "Report"
                        )
                    )
                )
            );
        } else {
            editBtn = React.createElement(
                "div",
                { className: "dropdown pull-right" },
                React.createElement(
                    "button",
                    { className: "btn btn-default dropdown-toggle", type: "button", id: "dropdownMenu1", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "true" },
                    React.createElement("span", { className: "caret" })
                ),
                React.createElement(
                    "ul",
                    { className: "dropdown-menu " },
                    React.createElement(
                        "li",
                        null,
                        React.createElement(
                            "a",
                            { href: "#", onClick: this.props.reportContent },
                            "Report"
                        )
                    )
                )
            );
        }
        var permalink = "/permalink/" + this.props.contentID;
        var authorlink = "/" + this.props.author.name.replace(" ", ".");

        return React.createElement(
            "div",
            { className: "author" },
            React.createElement(
                "div",
                { className: "col-md-10 col-xs-10" },
                React.createElement("img", { className: "img-circle", src: imgpath }),
                React.createElement(
                    "strong",
                    null,
                    React.createElement(
                        "a",
                        { href: authorlink },
                        this.props.author.name
                    )
                ),
                " ",
                prettyDate(this.props.time),
                React.createElement("br", null),
                React.createElement(
                    "a",
                    { href: permalink },
                    "#",
                    this.props.contentID
                )
            ),
            React.createElement(
                "div",
                { className: "col-md-2 col-xs-2" },
                editBtn
            )
        );
    }

});

var AuthorText = React.createClass({
    displayName: "AuthorText",


    componentDidMount: function () {
        var domNode = ReactDOM.findDOMNode(this);
        var nodes = domNode.querySelectorAll('code');
        if (nodes.length > 0) {
            for (var i = 0; i < nodes.length; i = i + 1) {
                $(nodes[i]).wrap('<pre className="SourceCode"></pre>');
                hljs.highlightBlock(nodes[i]);
            }
        }
    },

    render: function () {

        var content = this.props.data.text;
        var re = /(\<code[\]\>[\s\S]*?(?:.*?)<\/code\>*?[\s\S])|(#\S*)|(@\S*)/gi;

        var m;
        var hash;
        var tmp_content = content;
        var user = "";
        while ((m = re.exec(content)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }

            if (typeof m[2] != "undefined") {
                hash = m[2].replace("#", "");
                tmp_content = tmp_content.replace(m[2], '<a href="/hash/' + hash + '">#' + hash + '</a>');
            }
            if (typeof m[3] != "undefined") {
                user = m[3].replace("@", "");
                tmp_content = tmp_content.replace(m[3], '<a href="/' + user + '">@' + user + '</a>');
            }
        }

        tmp_content = tmp_content.replace(/\r\n/g, "<br/>");

        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "text" },
                React.createElement("span", { dangerouslySetInnerHTML: { __html: tmp_content } })
            ),
            React.createElement(
                "div",
                { className: "action" },
                React.createElement(
                    "a",
                    { className: "btn save hide btn-success" },
                    "Save"
                )
            )
        );
    }
});

var CommentList = React.createClass({
    displayName: 'CommentList',

    render: function () {
        var commentNodes = this.props.data.map(function (comment) {

            comment.text = Replacehashtags(comment.text);
            return React.createElement(
                Comment,
                { author: comment.author },
                comment.text
            );
        });
        return React.createElement(
            'div',
            { className: 'commentList' },
            commentNodes
        );
    }
});

var CommentBox = React.createClass({
    displayName: 'CommentBox',

    getInitialState: function () {
        return { data: [] };
    },
    componentDidMount: function () {
        this.loadCommentsFromServer();
        bindMention();
        //setInterval(this.loadCommentsFromServer, 10000);
    },
    loadCommentsFromServer: function () {
        $.ajax({
            url: '/api/comment/' + this.props.id,
            dataType: 'json',
            cache: false,
            success: function (data) {
                this.setState({ data: data });
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    handleCommentSubmit: function (comment) {

        $.ajax({
            url: '/api/comment/' + this.props.id,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: function (data) {
                this.setState({ data: data });
            }.bind(this),
            error: function (xhr, status, err) {
                if (err.toString() == "Forbidden") {
                    alert("Please login");
                }
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    render: function () {

        var commentForm = "";
        if (user_id > 0) {
            commentForm = React.createElement(CommentForm, { onCommentSubmit: this.handleCommentSubmit });
        } else {
            commentForm = React.createElement(
                'h4',
                null,
                'Please ',
                React.createElement(
                    'a',
                    { className: 'btn btn-success', href: '/user/register/' },
                    'login'
                ),
                ' to post a comment'
            );
        }
        return React.createElement(
            'div',
            { className: 'commentBox' },
            commentForm,
            React.createElement(CommentList, { data: this.state.data })
        );
    }
});

var CommentHint = React.createClass({
    displayName: 'CommentHint',


    getInitialState: function () {
        return { showComment: false };
    },
    handleClick: function (e) {
        if (this.state.showComment == true) {
            show = false;
        } else {
            show = true;
        }

        this.setState({ showComment: show });
    },
    render: function () {

        return React.createElement(
            'div',
            { className: 'CommentBox' },
            React.createElement(
                'span',
                { onClick: this.handleClick.bind(this, this.props.id), className: 'btn fa fa-comments' },
                '  ',
                this.props.commentCnt
            ),
            this.state.showComment ? React.createElement(CommentBox, { id: this.props.id }) : null
        );
    }
});

var CommentForm = React.createClass({
    displayName: 'CommentForm',

    handleSubmit: function (e) {
        e.preventDefault();

        var text = ReactDOM.findDOMNode(this.refs.text).value.trim();
        if (!text) {
            return;
        }

        this.props.onCommentSubmit({ text: text });
        ReactDOM.findDOMNode(this.refs.text).value = '';
        return;
    },
    render: function () {
        return React.createElement(
            'form',
            { className: 'commentForm', onSubmit: this.handleSubmit },
            React.createElement('textarea', { className: 'form-control', ref: 'text' }),
            React.createElement('input', { className: 'btn btn-success col-xs-12 col-md-2', type: 'submit', value: 'Comment' })
        );
    }
});

var Comment = React.createClass({
    displayName: 'Comment',


    render: function () {

        var imgpath = this.props.author.profile_picture;
        if (typeof this.props.author.profile_picture == "undefined") {
            imgpath = "/public/img/default-profile.png";
        }

        var authorLink = "/" + this.props.author.name.replace(" ", ".");
        return React.createElement(
            'div',
            { className: 'comment' },
            React.createElement('img', { className: 'img-circle', src: imgpath }),
            React.createElement(
                'h4',
                { className: 'commentAuthor' },
                React.createElement(
                    'a',
                    { href: authorLink },
                    this.props.author.name
                )
            ),
            React.createElement('span', { dangerouslySetInnerHTML: { __html: this.props.children.toString() } })
        );
    }
});

var StreamList = React.createClass({
    displayName: "StreamList",


    render: function () {
        var streamNodes = this.props.data.map(function (data) {

            var editContent = function (e) {
                e.preventDefault();
                var streamItem = $(".stream-item[data-id=" + data.stream.id + "]");
                streamItem.find(".text").attr("contenteditable", "true").focus();
                streamItem.find(".text").html(streamItem.find(".text").text());
                streamItem.find(".action .save").removeClass("hide");
                streamItem.find(".action .save").click(function () {
                    $.ajax({
                        url: '/api/content/' + data.stream.id,
                        data: { "content": streamItem.find(".text").text() },
                        type: 'PUT',
                        success: function (result) {
                            if (result.status == "done") {
                                streamItem.find(".action .save").addClass("hide");
                                streamItem.find(".text").attr("contenteditable", "false");
                                streamItem.find(".text").html(Replacehashtags(streamItem.find(".text").html()));
                            }
                        }
                    });
                });
            };
            var deleteContent = function (e) {
                e.preventDefault();
                $.ajax({
                    url: '/api/content/' + data.stream.id,
                    type: 'DELETE',
                    success: function (result) {
                        if (result.status == "deleted") {
                            $(".stream-item[data-id=" + data.stream.id + "]").remove();
                        }
                    }
                });
            };
            var reportContent = function (e) {
                e.preventDefault();
                $.ajax({
                    url: '/api/content/report/' + data.stream.id,
                    type: 'POST',
                    success: function (result) {
                        if (result.status == "reported") {
                            $(".stream-item[data-id=" + data.stream.id + "]").html("<h2 class='text-center'>Reported</h2><p class='text-center'>Thank you, we will validate the post soon</p>");
                        }
                    }
                });
            };

            var GoogleVision = data.stream.vision.replace(/#(\S*)/g, '<a class="hash" href="/hash/$1">#$1</a>');
            return React.createElement(
                "div",
                { "data-id": data.stream.id, className: "row stream-item" },
                React.createElement(Author, { editContent: editContent, deleteContent: deleteContent, reportContent: reportContent, id: data.author.id, author: data.author, contentID: data.stream.id, time: data.stream.date }),
                React.createElement(AuthorText, { id: data.stream.id, data: data.stream }),
                React.createElement(Content, { id: data.stream.id, data: data.stream }),
                React.createElement("div", { dangerouslySetInnerHTML: { __html: GoogleVision } }),
                React.createElement(
                    "div",
                    { className: "streamFooter" },
                    React.createElement(Likebox, { id: data.stream.id }),
                    React.createElement(CommentHint, { id: data.stream.id, commentCnt: data.stream.comment_cnt })
                )
            );
        });

        return React.createElement(
            "div",
            { className: "stream" },
            streamNodes
        );
    }
});

var Content = React.createClass({
    displayName: "Content",


    render: function () {

        var imgpath = "";
        if (this.props.data.type == "generic") {
            return React.createElement("div", { className: "generic" });
        }
        if (this.props.data.type == "img") {
            imgpath = this.props.data.url;
            srcset = this.props.data.thumb_url;
            return React.createElement(
                "div",
                { className: "img" },
                React.createElement(
                    "picture",
                    null,
                    React.createElement("source", { media: "(max-width: 550px)", srcSet: srcset }),
                    React.createElement("img", { className: "img-responsive", src: imgpath, srcset: srcset })
                )
            );
        }
        if (this.props.data.type == "upload") {
            return React.createElement(Upload, { id: this.props.data.id, upload: this.props.data });
        }
        if (this.props.data.type == "www") {
            return React.createElement(WWW, { id: this.props.data.id, meta: this.props.data });
        }
        if (this.props.data.type == "video") {
            return React.createElement(Video, { id: this.props.data.id, meta: this.props.data });
        }
    }
});

var Upload = React.createClass({
    displayName: "Upload",


    render: function () {
        var ImgPath,
            FilePath = "";
        var Img = "";
        var Files = "";
        // 
        if (typeof this.props.upload.files != "undefined") {

            var Files = this.props.upload.files.map(function (data) {
                FilePath = data.src;

                if (data.type != false && data.type.match("image")) {
                    return React.createElement("img", { className: "img-responsive", src: FilePath });
                }
                if (data.type != false && data.type.match("video")) {
                    return React.createElement(
                        "video",
                        null,
                        React.createElement("source", { src: FilePath, type: data.type })
                    );
                }
                return React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "a",
                        { href: FilePath, target: "_blank" },
                        React.createElement("span", { className: "glyphicon glyphicon-circle-arrow-down" }),
                        "  ",
                        data.name
                    )
                );
            });
        }

        return React.createElement(
            "div",
            { className: "upload" },
            Files
        );
    }
});

var WWW = React.createClass({
    displayName: "WWW",


    render: function () {

        return React.createElement(
            "div",
            { className: "www" },
            React.createElement(
                "a",
                { href: this.props.meta.url },
                React.createElement("img", { className: "img-responsive", src: this.props.meta.og_img }),
                React.createElement(
                    "h2",
                    null,
                    this.props.meta.og_title
                )
            ),
            React.createElement(
                "p",
                null,
                this.props.meta.og_description
            )
        );
    }
});

var Video = React.createClass({
    displayName: "Video",


    render: function () {
        return React.createElement(
            "div",
            { className: "video" },
            React.createElement("div", { className: "embed-responsive embed-responsive-16by9", dangerouslySetInnerHTML: { __html: this.props.meta.html } })
        );
    }
});

var Likebox = React.createClass({
    displayName: 'Likebox',

    getInitialState: function () {
        return { data: [] };
    },
    componentDidMount: function () {
        this.loadLikesFromServer();
    },
    loadLikesFromServer: function () {
        $.ajax({
            url: '/api/score/' + this.props.id,
            dataType: 'json',
            cache: false,
            success: function (data) {
                this.setState({ like: data.like, dislike: data.dislike });
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },

    handleSubmit: function (target, e) {

        e.preventDefault();

        if (user_id == 0) {
            $(e.target).parent().parent().html('<p>To vote please <a class="btn btn-success" href="/user/register/">join us</a></p>');
        }
        $.ajax({
            url: '/api/score/' + target + '/' + this.props.id,
            method: "POST",
            dataType: 'json',
            cache: false,
            success: function (data) {
                this.setState({ like: data.like, dislike: data.dislike });
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    render: function () {

        return React.createElement(
            'div',
            null,
            React.createElement(
                'form',
                { 'data-id': '{this.props.id}', className: 'Likebox', onSubmit: this.handleSubmit },
                React.createElement(
                    'span',
                    { onClick: this.handleSubmit.bind(this, "add"), dest: 'up', className: 'glyphicon glyphicon-chevron-up btn' },
                    ' ',
                    this.state.like
                ),
                React.createElement(
                    'span',
                    { onClick: this.handleSubmit.bind(this, "sub"), dest: 'down', className: 'glyphicon glyphicon-chevron-down btn' },
                    ' ',
                    this.state.dislike
                )
            )
        );
    }
});

var SearchBox = React.createClass({
    displayName: "SearchBox",

    getInitialState: function () {
        return { data: [], hashtag: [], user: [] };
    },
    componentDidMount: function () {

        $('html').click(function () {
            this.setState({ hashtag: [] });
            this.setState({ user: [] });
        }.bind(this));
    },

    handleChange: function (event) {
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
            this.setState({ hashtag: [] });
            this.setState({ user: [] });
            return true;
        }
        this.serverRequest = $.get('/api/hashtags/' + event.target.value, function (data) {

            this.setState({ hashtag: data });
        }.bind(this));

        this.serverRequest = $.get('/api/users/' + event.target.value, function (data) {

            this.setState({ user: data });
        }.bind(this));
    },

    render: function () {

        return React.createElement(
            "div",
            { className: "form-group navbar-form navbar-left " },
            React.createElement("input", { onKeyUp: this.handleChange, type: "text", className: "form-control", placeholder: "#hash or @user" }),
            React.createElement(
                "ul",
                { className: "searchresult" },
                this.state.user.map(function (user, i) {
                    if (i > 4) return true;
                    setting = JSON.parse(user.settings);
                    if (typeof setting.profile_picture != "undefined") {
                        img_src = upload_address + setting.profile_picture;
                    } else {
                        img_src = '/public/img/no-profile.jpg';
                    }
                    user_href = "/" + user.name.replace(" ", ".");
                    return React.createElement(
                        "li",
                        null,
                        React.createElement(
                            "a",
                            { href: user_href },
                            user.name,
                            " ",
                            React.createElement("img", { width: "20", className: "pull-right", src: img_src })
                        )
                    );
                }),
                this.state.hashtag.map(function (item, i) {
                    if (i > 4) return true;
                    hashtag_href = "/hash/" + item.hashtag;
                    return React.createElement(
                        "li",
                        null,
                        React.createElement(
                            "a",
                            { href: hashtag_href },
                            "#",
                            item.hashtag
                        )
                    );
                })
            )
        );
    }
});


var socket;
var ChatBox = React.createClass({
    displayName: "ChatBox",

    getInitialState: function () {
        return { channel: [], activeUser: [] };
    },

    componentDidMount: function () {

        try {
            socket = new WebSocket(notification_server);

            socket.onopen = function (msg) {

                socket.send(JSON.stringify({ action: "openroom", auth_cookie: getCookie("auth") }));
            };
            socket.onmessage = function (msg) {

                data = JSON.parse(msg.data);

                this.setState({ activeUser: Object.keys(swap(data.activeUsers)), channel: data.channel.default });
                var objDiv = document.getElementById("textframe");
                objDiv.scrollTop = objDiv.scrollHeight;
            }.bind(this);
            socket.onclose = function (msg) {};
        } catch (ex) {

            console.log(ex);
        }
    },

    handleSubmit: function (event) {
        event.preventDefault();
        socket.send(JSON.stringify({ action: "chat", text: document.getElementById("chatinput").value, auth_cookie: getCookie("auth") }));
        document.getElementById("chatinput").value = "";
        var objDiv = document.getElementById("textframe");
        objDiv.scrollTop = objDiv.scrollHeight;
    },

    render: function () {

        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { id: "chat", className: "col-md-9 bounceIn" },
                React.createElement(
                    "div",
                    { id: "textframe" },
                    this.state.channel.map(function (chat, i) {
                        chat = Replacehashtags(chat);
                        return React.createElement("p", { dangerouslySetInnerHTML: { __html: chat } });
                    })
                ),
                React.createElement(
                    "form",
                    { className: "chatForm", onSubmit: this.handleSubmit },
                    React.createElement("input", { type: "text", autoComplete: "off", id: "chatinput" })
                )
            ),
            React.createElement(
                "div",
                { id: "ChatUsers", className: "col-md-3" },
                React.createElement(
                    "ul",
                    null,
                    this.state.activeUser.map(function (user, i) {
                        return React.createElement(
                            "li",
                            null,
                            React.createElement("span", { dangerouslySetInnerHTML: { __html: user } })
                        );
                    })
                )
            )
        );
    }
});

var ShareBox = React.createClass({
    displayName: "ShareBox",

    getInitialState: function () {
        return { data: [], showShareBox: true };
    },
    componentDidMount: function () {

        this.setState({
            isMetaLoading: false
        });

        var share_area = this.refs.share_area;
        share_area.addEventListener('input', this.handleInput);
        bindMention();
    },

    /*
     * @todo remove jquery 
     */
    closePreview: function (e) {
        e.preventDefault();
        $(".preview").hide();
        $("#img").val("");
        $("#metadata").val("");
        this.setState({
            isMetaLoading: false
        });
    },

    renderPreview: function (scope) {
        if ($("#share_area").val() == this.state.data.url) $("#share_area").val("");

        $(".preview").hide();
        $(".preview." + scope).show();
    },
    handleInput: function (event) {

        var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        if ($("#share_area").val().match(urlRegex)) {

            var url = this.refs.share_area.value.match(urlRegex);

            if (this.state.isMetaLoading) return false;

            this.setState({
                isMetaLoading: true
            });
            this.serverRequest = $.get('/api/metadata/?url=' + url, function (data) {
                this.setState({
                    data: data
                });

                this.renderPreview(data.type);
            }.bind(this));
        }
    },
    render: function () {

        return React.createElement(
            "div",
            null,
            React.createElement(
                "form",
                { method: "post", action: "/api/content/", encType: "multipart/form-data" },
                React.createElement(
                    "div",
                    { className: "row" },
                    React.createElement(
                        "div",
                        { className: "col-md-11" },
                        React.createElement("textarea", { id: "share_area", ref: "share_area", placeholder: "", name: "content", rows: "3", className: "form-control" }),
                        React.createElement(
                            "div",
                            { className: "row preview www" },
                            React.createElement(
                                "p",
                                { className: "text-right" },
                                React.createElement(
                                    "button",
                                    { className: "btn btn-info", onClick: this.closePreview },
                                    React.createElement("span", { className: "glyphicon glyphicon-remove", "aria-hidden": "true" })
                                )
                            ),
                            React.createElement(
                                "div",
                                { className: "col-md-3" },
                                React.createElement("img", { className: "img-responsive", src: this.state.data.og_img, id: "og_img" })
                            ),
                            React.createElement(
                                "div",
                                { className: "col-md-9" },
                                React.createElement(
                                    "h3",
                                    { id: "og_title" },
                                    this.state.data.og_title
                                ),
                                React.createElement(
                                    "p",
                                    { id: "og_desc" },
                                    this.state.data.og_description
                                )
                            ),
                            React.createElement(
                                "div",
                                { className: "col-md-12" },
                                React.createElement(
                                    "a",
                                    { href: this.state.data.url, id: "www_link" },
                                    this.state.data.url
                                )
                            )
                        ),
                        React.createElement(
                            "div",
                            { className: "row preview img" },
                            React.createElement(
                                "div",
                                { className: "col-md-12" },
                                React.createElement(
                                    "p",
                                    { className: "text-right" },
                                    React.createElement(
                                        "button",
                                        { className: "btn btn-info", onClick: this.closePreview },
                                        React.createElement("span", { className: "glyphicon glyphicon-remove", "aria-hidden": "true" })
                                    )
                                ),
                                React.createElement("img", { className: "img-responsive", src: this.state.data.url, id: "preview_img" })
                            )
                        ),
                        React.createElement(
                            "div",
                            { className: "row preview upload" },
                            React.createElement(
                                "div",
                                { className: "col-md-12" },
                                React.createElement(
                                    "p",
                                    { className: "text-right" },
                                    React.createElement(
                                        "button",
                                        { className: "btn btn-info", onClick: this.closePreview },
                                        React.createElement("span", { className: "glyphicon glyphicon-remove", "aria-hidden": "true" })
                                    )
                                ),
                                React.createElement("div", { id: "uploadPreview" })
                            )
                        ),
                        React.createElement(
                            "div",
                            { className: "row preview video" },
                            React.createElement(
                                "div",
                                { className: "col-md-12" },
                                React.createElement(
                                    "p",
                                    { className: "text-right" },
                                    React.createElement(
                                        "button",
                                        { className: "btn btn-info", onClick: this.closePreview },
                                        React.createElement("span", { className: "glyphicon glyphicon-remove", "aria-hidden": "true" })
                                    )
                                ),
                                React.createElement("div", { id: "video_target", className: "embed-responsive embed-responsive-16by9", dangerouslySetInnerHTML: { __html: this.state.data.html } })
                            )
                        ),
                        React.createElement("input", { type: "hidden", name: "metadata", id: "metadata", value: JSON.stringify(this.state.data) }),
                        React.createElement("input", { type: "text", name: "mail", className: "hide", value: "" })
                    ),
                    React.createElement(
                        "div",
                        { className: "col-md-5" },
                        React.createElement(
                            "span",
                            { className: "btn btn-lg btn-warning btn-file" },
                            React.createElement("i", { className: "glyphicon glyphicon-cloud-upload" }),
                            " Upload",
                            React.createElement("input", { type: "file", id: "img", multiple: true, name: "img[]", className: "form-control" })
                        ),
                        React.createElement(
                            "button",
                            { className: "btn btn-lg btn-info " },
                            React.createElement("i", { className: "glyphicon glyphicon-heart" }),
                            " Share!"
                        ),
                        React.createElement("p", { className: "fileinfo" })
                    )
                )
            )
        );
    }
});


var NotificationBox = React.createClass({
    displayName: "NotificationBox",

    getInitialState: function () {
        return { data: [], init: true };
    },

    componentDidMount: function () {

        var socket;
        try {
            socket = new WebSocket(notification_server);

            socket.onopen = function (msg) {

                socket.send(JSON.stringify({ action: "getNotifications", auth_cookie: getCookie("auth") }));
            };
            socket.onmessage = function (msg) {

                data = JSON.parse(msg.data);

                if (typeof data.notificaton != "undefined") {

                    //play only sound on new notifications
                    if (this.state.init === false) new Audio('/public/notification.mp3').play();
                    if (data.notificaton.length > 0) document.getElementById("NotificationBox").className = "";

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
        } catch (ex) {

            console.log(ex);
        }
    },

    render: function () {

        var li = [];
        for (notification in this.state.data) {

            notification = this.state.data[notification];

            if (typeof JSON.parse(notification.settings).profile_picture !== "undefined") {
                var img_src = upload_address + JSON.parse(notification.settings).profile_picture;
                profile_pic = React.createElement("img", { src: img_src });
            } else profile_pic = React.createElement("img", { src: "/public/img/no-profile.jpg" });

            safe_username = "/" + notification.name.replace(" ", ".");
            user_link_pic = React.createElement(
                "a",
                { href: safe_username },
                profile_pic
            );
            user_link = React.createElement(
                "a",
                { href: safe_username },
                notification.name
            );

            li.push(React.createElement(
                "p",
                null,
                user_link_pic,
                " ",
                user_link,
                " ",
                React.createElement("span", { dangerouslySetInnerHTML: { __html: notification.message } })
            ));
        }
        return React.createElement(
            "div",
            { ref: "notification" },
            li
        );
    }
});


var InitStream = React.createClass({
    displayName: 'InitStream',

    getInitialState: function () {
        window.show = true;
        return { data: [], random: false };
    },
    componentDidMount: function () {
        this.loadStreamFromServer();

        document.addEventListener('scroll', this.handleScroll);
        document.addEventListener('keydown', this.handleKeyDown);
        $("#next").on("click", this.randomPost);

        //@todo better soloution would be to save the complete data as state
        window.onpopstate = function (event) {
            window.location.href = event.state.url;
        };
    },

    handleKeyDown: function (event) {

        if (event.target.tagName == "BODY" && event.keyCode == 82) {
            this.randomPost();
        }
    },

    randomPost: function () {
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
    },
    componentWillUnmount: function () {
        document.removeEventListener('scroll', this.handleScroll);
    },

    loadStreamFromServer: function () {

        var hash = "";
        var user = "";

        var show = 5;
        var lastid = "";

        if (this.id > 0 || typeof id == "undefined") {

            var ids = $(".stream-item").map(function () {
                return parseInt($(this).attr("data-id"), 10);
            }).get();

            this.setID(Math.min.apply(Math, ids));
        }

        if ($(".stream-row").attr("data-permalink") > 0) {

            this.setID(parseInt($(".stream-row").attr("data-permalink")) + 1);
            show = 1;
            this.setState({
                endofData: true
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
                endofData: true
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

                this.setState({ data: data });
                if (user_settings == false || user_settings.autoplay == "no") {
                    this.setAutoplayOff();
                }
                if (user_settings == false || user_settings.mute_video == "yes") {
                    this.setMuted();
                }
                if (this.state.show == "random") {
                    url = "/permalink/" + data[0].stream.id;
                    var stateObj = { id: data[0].stream.id, url: url };
                    history.pushState(stateObj, "irgendwas", url);
                }

                this.setState({
                    loadingFlag: false
                });
                $(".spinner").hide();
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },

    render: function () {

        if (this.state.show == "random") {
            return React.createElement(
                'div',
                { className: 'content' },
                React.createElement(StreamList, { data: this.state.data })
            );
        }
        if (user_settings.show_nsfw == "false" && $(".stream-row").attr("data-hash") == "nsfw") {

            return React.createElement(
                'div',
                { className: 'content' },
                'You disabled not safe for work content'
            );
        }
        if (user_settings == false && $(".stream-row").attr("data-hash") == "nsfw") {
            return React.createElement(
                'div',
                { className: 'content' },
                'You need to be over +18 to watch nsfw content, please ',
                React.createElement(
                    'a',
                    { href: '/user/register/' },
                    'register here.'
                )
            );
        }
        return React.createElement(
            'div',
            { className: 'content' },
            React.createElement(StreamList, { data: this.state.data })
        );
    },
    setAutoplayOff: function () {

        $('video').each(function (index) {
            $("video").get(index).pause();
        });
    },
    setMuted: function () {

        $("video").prop('muted', true);
    },
    setID: function (id) {
        this.id = id;
    },

    handleScroll: function (event) {

        if (this.state.endofData) {
            return true;
        }
        //this function will be triggered if user scrolls
        var windowHeight = $(window).height();
        var inHeight = window.innerHeight;
        var scrollT = $(window).scrollTop();
        var totalScrolled = scrollT + inHeight;
        if (totalScrolled + 100 > windowHeight) {
            //user reached at bottom
            if (!this.state.loadingFlag) {
                //to avoid multiple request
                this.setState({
                    loadingFlag: true
                });

                this.loadStreamFromServer();
            }
        }
    }
});

var data = {};

ReactDOM.render(React.createElement(InitStream, { data: data }), document.getElementsByClassName('stream')[0]);
ReactDOM.render(React.createElement(SearchBox, { data: data }), document.getElementById("SearchBox"));
ReactDOM.render(React.createElement(NotificationBox, { data: data }), document.getElementById("NotificationBox"));
ReactDOM.render(React.createElement(ChatBox, { data: data }), document.getElementById("ChatBox"));
ReactDOM.render(React.createElement(ShareBox, { data: data }), document.getElementById("ShareBox"));