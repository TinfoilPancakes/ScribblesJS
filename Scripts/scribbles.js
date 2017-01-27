/**
 * TrieNode
 */
var TrieNode = (function () {
    function TrieNode() {
        this.parent = null;
        this.value = 0;
        this.key = '';
        this.children = {};
    }
    TrieNode.prototype.readTo = function (path) {
        if (path === void 0) { path = ''; }
        var position = this;
        for (var i = 0; i < path.length; i++) {
            if (!position.children.hasOwnProperty(path.charAt(i))) {
                position.children[path.charAt(i)] = new TrieNode();
                position.children[path.charAt(i)].key = path.charAt(i);
                position.children[path.charAt(i)].parent = position;
            }
            position = position.children[path.charAt(i)];
        }
        return position;
    };
    TrieNode.prototype.getKeyPath = function () {
        var keyString = '';
        var position = this;
        while (position != null) {
            keyString = position.key + keyString;
            position = position.parent;
        }
        return keyString;
    };
    TrieNode.prototype.getSearchResults = function () {
        var results = [];
        var toDive = [];
        for (var key in this.children) {
            if (this.children.hasOwnProperty(key)) {
                if (this.children[key].value > 0) {
                    results.push(this.children[key]);
                }
                if (Object.keys(this.children[key].children).length > 0) {
                    toDive.push(this.children[key]);
                }
            }
        }
        for (var i = 0; i < toDive.length; i++) {
            var tempResults = toDive[i].getSearchResults();
            for (var n = 0; n < tempResults.length; n++) {
                results.push(tempResults[n]);
            }
        }
        results.sort(function (a, b) {
            return b.value - a.value;
        });
        return results;
    };
    TrieNode.prototype.readIn = function (path) {
        this.readTo(path).value++;
    };
    return TrieNode;
})();
var TrieLookupJS = angular.module('TrieLookupJS', ['ngSanitize']);
TrieLookupJS.controller('TrieControl', function ($scope, $http, $window) {
    $scope.rootNode = new TrieNode();
    $scope.wordCount = 0;
    $scope.maxResults = 8;
    $scope.selection = 0;
    $scope.lastSelection = '';
    $scope.lastPrefix = '';
    $scope.firstSuffix = '';
    $scope.version = '0.0.5';
    $scope.reloadContent = function () {
        console.log('Reloading content...');
        if (localStorage.getItem('content')) {
            $scope.content = localStorage.getItem('content');
            $scope.content.split(/[^\w\d'-]+/).forEach(function (word) {
                $scope.rootNode.readIn(word);
            });
        }
        console.log('Done.');
    };
    $scope.getWordCount = function (textValue) {
        var temp = textValue.match(/[\w\d'-]+/g);
        if (temp != null) {
            $scope.wordCount = temp.length;
        }
        else {
            $scope.wordCount = 0;
        }
    };
    $scope.updateSelection = function ($index, result) {
        if (result === void 0) { result = null; }
        if (result != null) {
            if ($index == $scope.selection) {
                $scope.lastSelection = result.getKeyPath();
                return '<span class="Selected">' + result.getKeyPath() + '</span>';
            }
            else {
                return '<span class="NotSelected">' + result.getKeyPath() + '</span>';
            }
        }
    };
    $scope.catchKeyUp = function (textValue, $event) {
        if (textValue === void 0) { textValue = ''; }
        if ($event === void 0) { $event = null; }
        if ($event != null) {
            if ($event.keyCode == 9) {
                var cPos = $scope.getCaretPosition($event.target);
                var before = textValue.substr(0, cPos - $scope.lastPrefix.length);
                var after = textValue.substr(cPos + $scope.firstSuffix.length, textValue.length - 1);
                $event.target.value = before + $scope.lastSelection + after;
                $scope.selection = 0;
            }
            else if ($event.keyCode == 13 || $event.keyCode == 32 || $event.keyCode == 9 || $event.keyCode >= 186) {
                $scope.lastSelection = '';
                $scope.selection = 0;
                var keyPress = String.fromCharCode($event.keyCode);
                $scope.rootNode.readIn($scope.lastPrefix);
            }
        }
        $scope.lastPrefix = $scope.getLastPrefix($event.target.value, $event);
        $scope.firstSuffix = $scope.getFirstSuffix($event.target.value, $event);
    };
    $scope.catchKeyDown = function (textValue, $event) {
        if (textValue === void 0) { textValue = ''; }
        if ($event === void 0) { $event = null; }
        if ($event != null) {
            if ($event.keyCode == 9) {
                $event.preventDefault();
            }
            else if ($event.keyCode == 40 || $event.keyCode == 38) {
                $event.preventDefault();
                if ($event.keyCode == 40 && $scope.selection < $scope.maxResults - 1) {
                    $scope.selection++;
                }
                else if ($event.keyCode == 38 && $scope.selection > 0) {
                    $scope.selection--;
                }
            }
            else {
                $scope.selection = 0;
            }
        }
    };
    $scope.getCaretPosition = function (oField) {
        var iCaretPos = 0;
        if (document.selection) {
            oField.focus();
            var oSel = document.selection.createRange();
            oSel.moveStart('character', -oField.value.length);
            iCaretPos = oSel.text.length;
        }
        else if (oField.selectionStart || oField.selectionStart == '0') {
            iCaretPos = oField.selectionStart;
        }
        return iCaretPos;
    };
    $scope.getLastPrefix = function (textValue, $event) {
        if (textValue === void 0) { textValue = ''; }
        if ($event === void 0) { $event = null; }
        if ($event != null) {
            var element = $event.target;
            var cPos = $scope.getCaretPosition(element);
            var matches = textValue.substr(0, cPos).split(/[^\w\d'-]+/);
            if (matches != null) {
                return matches[matches.length - 1];
            }
            else {
                return '';
            }
        }
        else {
            var matches = textValue.split(/[^\w\d'-]+/);
            if (matches != null) {
                return matches[matches.length - 1];
            }
            else {
                return '';
            }
        }
    };
    $scope.getFirstSuffix = function (textValue, $event) {
        if (textValue === void 0) { textValue = ''; }
        if ($event === void 0) { $event = null; }
        if ($event != null) {
            var element = $event.target;
            var cPos = $scope.getCaretPosition(element);
            var matches = textValue.substr(cPos, textValue.length - 1).split(/[^\w\d']+/);
            if (matches != null) {
                return matches[0];
            }
            else {
                return '';
            }
        }
        else {
            var matches = textValue.split(/[^\w\d']+/);
            if (matches != null) {
                return matches[0];
            }
            else {
                return '';
            }
        }
    };
    $scope.searchRootNode = function (prefix) {
        if (prefix === void 0) { prefix = ''; }
        if (prefix.length > 1) {
            return $scope.rootNode.readTo(prefix).getSearchResults();
        }
        else {
            return null;
        }
    };
    $http.get('Assets/Dictionaries/words.txt').then(function (response) {
        console.log('Reading in dictionary...');
        var lines = response.data.split('\n');
        lines.forEach(function (word) {
            $scope.rootNode.readIn(word);
        });
        console.log('Done.');
    });
    $http.get('Assets/Dictionaries/frequencyList.txt').then(function (response) {
        console.log('Reading frequencies...');
        var lines = response.data.split('\n');
        lines.forEach(function (line) {
            var freq = line.match(/[\d]+/);
            var path = line.match(/[^\d\s]+/);
            $scope.rootNode.readTo(String(path)).value = Number(freq);
        });
        console.log('Done.');
    });
    window.onbeforeunload = function () {
        console.log('Saving...');
        if ($scope.content != null) {
            localStorage.setItem('content', $scope.content);
        }
        console.log('Done.');
    };
});
