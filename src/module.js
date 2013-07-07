angular.module('ChessGame', []).factory(
  'loadTemplates', function($templateCache, $http) {
    return function(basePath) {
      _.each(
        ["board.html", "square.html", "piece.html", "move_table.html"], 
        function(templateName) {
          $.ajax({
            url: basePath + templateName,
            success: function(html) {
              $templateCache.put(templateName, html);
            },
            async: false
          });
        });
    }
  });
