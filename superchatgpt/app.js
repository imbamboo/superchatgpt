$(() => {
    console.log("hello");
    const app = Vue.createApp({
        data() {
            return {
                dialogList: [
                ],
                nextPrompt: "",
                loading: false,
            };
        },
        methods: {
            scrollToBottom() {
                // const $el = $("#dialog_list");
                // // // $el.animate({scrollTop: $el.scrollHeight}, "fast");
                // // $el.animate({ scrollTop: $el.prop("scrollHeight")}, 10);
                // $el.scrollTop($el.prop("scrollHeight"));
                window.setTimeout(() => {
                    $("#toolInput").focus();
                    window.setTimeout(() => {
                        $("#txtPrompt").focus();
                    }, 100);
                }, 100);
            },
            getText(dialogItem) {
                if (dialogItem.type === "AI") {
                    return dialogItem.text.replace(/^？/, "").trim()
                        .replace(/^AI: */, "")
                        .trim().replace(/^Robot:/, "")
                        .trim().replace(/^Bot:/, "")

                }

                return dialogItem.text;
            },
            getTitle(dialogItem) {
                switch (dialogItem.type) {
                    case "Human":
                        return "你";
                    case "AI":
                        return "AI";
                    case "ERR":
                        return "系统";
                }
                return "N/A";
            },
            handleInputKeypress(event) {
                console.log("event", event);
                if (event.code !== "Enter" && event.code !== "NumpadEnter") {
                    return;
                }

                if (!this.nextPrompt) {
                    return;
                }

                this.dialogList.push({
                    type: "Human",
                    text: this.nextPrompt,
                });
                this.scrollToBottom();
                this.loading = true;
                this.nextPrompt = "";
                // console.log("s..", this.dialogList);
                this.sendRequest();
            },
            getPrompt() {
                let text = "";
                this.dialogList.forEach(x => {
                    if (x.type === "ERR") {
                        return;
                    }

                    if (text !== "") {
                        text += "\n";
                    }
                    if (x.type === "Human") {
                        text += "Human: " + x.text;
                    } else {
                        text += "AI: " + x.text;
                    }
                });
                return text;
            },
            sendRequest() {

                $.ajax({
                    url: "https://api.openai.com/v1/completions",
                    type: "POST",
                    dataType: 'json',
                    data: JSON.stringify({
                        "prompt": this.getPrompt(),
                        "model": "text-davinci-003",
                        "temperature": 0.8,
                        "max_tokens": 1024,
                        "stop": [" Human:", " AI:"]
                    }),
                    contentType: 'application/json; charset=utf-8',
                    headers: {"Authorization": "Bearer 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"},
                    success: (resp) => {
                        if (resp?.choices?.length > 0) {
                            this.dialogList.push({
                                type: "AI",
                                text: resp?.choices[0].text.trim(),
                            });
                            this.scrollToBottom();
                        }
                        this.loading = false;
                    },
                    error: (err) => {
                        this.dialogList.push({
                            type: "ERR",
                            text: "对不起，系统错误。",
                        });
                        this.scrollToBottom();
                        this.loading = false;
                    }
                })
            },
        },
        mounted() {
            console.log("mounted");
        },
    });
    app.mount('#app');
});