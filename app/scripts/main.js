'use strict';

(function() {
    var searchEngine = new SearchEngine();

    jQuery(window).load(function () {
        var jq = $,
            news = jq(".news");
        news.click(function (even) {
            var index = news.index(jq(this));
            var popUpArticleTitle = jq(this).find('.articleTitle').text(),
                response = searchEngine.getResponse(),
                pic = response.docs[index].multimedia,
                articleText = response.docs[index]['snippet'];
            jq(".popUpArticleTitle").text(popUpArticleTitle);

            jq(".articleText").text(articleText);
            jq(".articlePic").append("<img src='" + searchEngine.choosePicture(pic) + "'></img>");

            jq(".popUp").show();
        });

        jq(".popupBackground, .close").click(function () {
            jq(this).closest(".popUp").hide();
            jq(".articlePic img").remove();
        });

        var searchInput = jq('.search input[type="text"]');

        searchInput.change(function (event) {
            var value = searchInput.val() || "";
            if ((value.length > 0) && (value.length <= 3)) {
                return;
            }
            searchEngine.search(value);
        });

        jq(".form_search").submit(function (event) {
            event.preventDefault();
            searchEngine.search(searchInput.val());
        });

        jq(".searchImg").click(function () {
            jq(".mobileSearch").toggle();
        });

        jq(".menuBut").click(function () {
            jq(".rightMenuBlock").toggle(function () {
                    jq(".menuBut").css("background-position", "-50px -907px")
                }, function () {
                    jq(".menuBut").css("background-position", "-43px -1258px")
                }
            );
        });

        jq(".rightMenuBackground").click(function () {
            jq(".rightMenuBlock").hide();
            jq(".menuBut").css("background-position", "-50px -907px")
        });
        searchEngine.search();
    });
})();