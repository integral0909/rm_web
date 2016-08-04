'use strict';

angular.module('rokketMed')
    .directive('toggleAlphabet', [function(getData) {
        return {
            restrict: "EA",
            replace: true,
            templateUrl: "directives/toggle-alphabet/toggle-alphabet-template.html",
            link: function($scope, element){
                $(element).find('li').on('click', function(e) {

                    $('.returned-list li').attr('id', function(i, id) {
                        id = id.replace(/[+:,\/()<>+]/g, "").replace(/\s+/g, "-").toLowerCase();
                        return id;
                    });

                    var alpha = $(this).text().toLowerCase();
                    var listItems = $('.returned-list li');
                    var list = [];

                    for (var i=0, len=listItems.length; i<len; i++)
                        list.push(listItems[i]);

                    for (var i=0, len=list.length; i<len; i++) {
                        if (list[i].id.indexOf(alpha) === 0) {
                            $('body, html').animate({scrollTop: $("#" +list[i].id+ "").position().top + 30}, 600);
                            $("#" +list[i].id+ "").delay(300).queue(function(next) {
                                $(this).addClass('fade-in-bg-color');
                                next();
                                $(this).delay(300).queue(function(next) {
                                    $(this).addClass('fade-out-bg-color');
                                    next();
                                });
                                $(this).removeClass('fade-out-bg-color');
                            });
                            break;
                        }
                    }

                    e.preventDefault();

                });

                var watch = $scope.$watchCollection(function() {
                    return $scope.dataLoaded == true;
                }, function() {
                    // Wait for templates to render
                    $scope.$evalAsync(function() {
                        // Finally, directives are evaluate and templates are renderer here
                        var $allLetters = {a : 0,b :0,c:0,d:0,e:0,f:0,g:0,h:0,i:0,j:0,k:0,l:0,m:0,n:0,o:0,p:0,q:0,r:0,s:0,t:0,u:0,v:0,w:0,x:0,y:0,z:0};
                        angular.forEach($scope.dataElements, function(value){
							if(typeof $allLetters[value.name.charAt(0).toLowerCase()] !== 'undefined'){
								$allLetters[value.name.charAt(0).toLowerCase()] = 1;
							}
                        });

                        angular.forEach($allLetters, function(value, key){
                            if(value == 1){
                                $('.'+key).removeClass('inactive');
                            }
                        });
                    });
                });
            }
        }
    }]);
