'use strict';

var SearchEngine = (function () {
    return function () {

        var response,
            jq = $;

        function checkResponse(response) {
            return (jq.type(response) === 'object') || response.hasOwnProperty('docs');
        }

        function checkElementExistence(elementClassName) {
            var element = jq(elementClassName);
            if (element.length <= 0) {
                return false;
            }
            return element;
        }

        this.choosePicture = function (pictures, size) {
            if (!jq.isArray(pictures) || pictures.length <= 0) {
                return SearchEngine.NO_PICTURE_SRC;
            }
            size = size || SearchEngine.PICTURE_LARGE;

            var minValue = Number.MAX_VALUE,
                maxValue = 0,
                maxIndex, minIndex;

            pictures.forEach(function (elem, index) {
                if (elem.hasOwnProperty('height')) {
                    if (maxValue < elem.height) {
                        maxValue = elem.height;
                        maxIndex = index;
                    }
                    if (minValue > elem.height) {
                        minValue = elem.height;
                        minIndex = index;
                    }
                }
            });
            return SearchEngine.DOCS_SOURCE +
                (size === SearchEngine.PICTURE_LARGE ? pictures[maxIndex].url : pictures[minIndex].url);
        };

        this.buildSearchParams = function (searchInFields, searchStr) {
            var result = Object.create(null);
            if ((jq.isArray(searchInFields) && (searchInFields.length <= 0)) ||
                ((jq.type(searchStr) !== 'string') || (searchStr.length <= 0))) {
                return result;
            }

            var str = '';
            searchInFields.forEach(function(element) {
                str += element + ':(' + searchStr + ') ';
            });
            result[SearchEngine.QYERY_FIELD_NAME] = str;
            return result;
        };

        this.buildRequestParams = function (responseFields) {
            var result = Object.create(null);
            if (!jq.isArray(responseFields) || responseFields.length <= 0) {
                return result;
            }
            result[SearchEngine.API_KEY_FIELD_NAME] = SearchEngine.API_KEY;
            result[SearchEngine.RESPONSE_FORMAT_FIELD_NAME] = SearchEngine.RESPONSE_FORMAT;
            result[SearchEngine.FIELDS_FILD_NAME] = responseFields.join();
            return result;
        };

        this.fillArticlesTitles = function (articlesClassName, response) {
            if (!checkResponse(response)) {
                return;
            }

            var articleElements;
            if (!(articleElements = checkElementExistence(articlesClassName))) {
                return;
            }

            articleElements.empty();
            articleElements.each(function (index) {
                if (index >= response.docs.length) {
                    return false;
                }
                var text = response.docs[index].headline['content_kicker'] ||
                    response.docs[index].headline['print_headline'] ||
                    response.docs[index].headline['main'];
                jq(this).text(text);
            });
        };

        this.fillPictures = function (picturesClassName, response) {
            if (!checkResponse(response)) {
                return;
            }
            var pictureElements;
            if (!(pictureElements = checkElementExistence(picturesClassName))) {
                return;
            }
            var self = this;
            pictureElements.empty();
            pictureElements.each(function (index) {
                var pic = undefined;
                if (index >= response.docs.length) {
                    return false;
                }
                pic = response.docs[index].multimedia;
                jq(this).append("<img src='" + self.choosePicture(pic,
                    screen.width <= 1024 ? SearchEngine.PICTURE_SMALL : SearchEngine.PICTURE_LARGE) + "'></img>");
            });
        };

        this.search = function (searchStr) {
            var self = this,
                requestParams = jq.param(jq.extend(
                    self.buildRequestParams(SearchEngine.RESPONSE_FIELDS),
                    self.buildSearchParams(SearchEngine.SEARCH_FIELDS, searchStr)));

            jq.ajax({
                url: SearchEngine.API_SOURCE,
                method: 'GET',
                data: requestParams
            }).done(function (res, status) {
                var news = jq(".news"),
                    noResults = jq(".noResults");
                self.setResponse(res.response);

                if (!checkResponse(self.getResponse()) || !jq.isArray((self.getResponse()).docs) ||
                    (self.getResponse().docs.length == 0)) {
                    news.hide();
                    noResults.show();
                    return;
                }
                news.show();
                noResults.hide();

                self.fillArticlesTitles(SearchEngine.ARTICLE_TITLES, self.getResponse());
                self.fillPictures(SearchEngine.ARTICLE_PICTURES, self.getResponse());
            });
        };

        this.setResponse = function (value) {
            response = value;
        };

        this.getResponse = function () {
            return response;
        };
    }
})();

SearchEngine.PICTURE_LARGE = 'large';
SearchEngine.PICTURE_SMALL = 'small';
SearchEngine.QYERY_FIELD_NAME = 'fq';
SearchEngine.RESPONSE_FORMAT_FIELD_NAME = 'response-format';
SearchEngine.RESPONSE_FORMAT = '.json';
SearchEngine.API_KEY_FIELD_NAME = 'api-key';
SearchEngine.API_KEY = 'fe9d9a44de75e3c5ce496822796223c6:5:72222197';
SearchEngine.FIELDS_FILD_NAME = 'fl';

SearchEngine.ARTICLE_TITLES = '.articleTitle';
SearchEngine.ARTICLE_PICTURES = '.picture';
SearchEngine.DOCS_SOURCE = 'http://www.nytimes.com/';
SearchEngine.API_SOURCE = 'http://api.nytimes.com/svc/search/v2/articlesearch.json';
SearchEngine.NO_PICTURE_SRC = 'images/noImage.png';

SearchEngine.RESPONSE_FIELDS = ['headline', 'multimedia', 'web_url', 'snippet'];
SearchEngine.SEARCH_FIELDS = ['body', 'byline', 'headline'];