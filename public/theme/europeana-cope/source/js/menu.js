/**
 * jQuery Europeana Menu plugin
 *
 * Based on
 * http://learn.jquery.com/plugins/basic-plugin-creation/
 * https://jqueryboilerplate.com/
 * https://css-tricks.com/snippets/jquery/jquery-plugin-template/
 * http://stefangabos.ro/jquery/jquery-plugin-boilerplate-revisited/
 */

;(function($, window, document, undefined) {
  $.europeanaMenu = function(element, options) {
    var plugin = this;
    plugin.settings = {};
    var $element = $(element), element = element;

    plugin.init = function() {
      plugin.settings = $.extend({}, $.europeanaMenu.defaultOptions, options);
      plugin.europeanaMenuAddToplevelClone();
      plugin.europeanaMenuHideInactive();
      plugin.europeanaMenuWatermark();
      //_europeanaMenu_private_method();
    };

    // clone the top level entries and add them to the dom
    plugin.europeanaMenuAddToplevelClone = function() {
      // don't clone if the home link is active
      if($element.find('li.home').hasClass('active')) {
        return;
      }
      // don't clone if the main menu does not have an active link
      if(!$element.find('li').hasClass('active')) {
        return;
      }
      // add a new ul for the cloned menu
      var clonedMenu = $('<ul>').attr({
        'class': 'backlinks play-menu',
        'id': 'backlinks'
      });
      // add all toplevel menu items to the cloned menu
      $element.find('> li:not(.home)').each(
          function() {
            // add menu link and classes to a new li
            clonedMenu.append(
                $('<li>')
                    .addClass($(this).attr('class'))
                    .append($(this).children('a').clone())
            );
            $(this).addClass('toplevel');
          }
      );
      // add the .home element to the end of the cloned menu
      $element.find('> li.home').each(
          function() {
            // add menu link and classes to a new li
            clonedMenu.append(
                $('<li>')
                    .addClass($(this).attr('class'))
                    .append($(this).children('a').clone())
            );
            $(this).addClass('toplevel');
          }
      );
      // add the clones menu to the dom after the original list
      $element.after(clonedMenu);
    };

    // hide all inactive items
    plugin.europeanaMenuHideInactive = function() {
      if(!$element.find('li.home').hasClass('active')) {
        // this happens when we're not on the .home page
        $element.find('> li').each(
            function() {
              if(!$element.data('hasActiveLink') && !$(this).hasClass('active')) {
                $(this).find('ul.sub-menu').hide();
              } else if(!$(this).hasClass('active')) {
                $(this).hide();
              }
            }
        );
      } else {
        // this only happens when we are on the .home page
        $element.find('ul.sub-menu').hide();
      }
    };

    // add a class to show we were here
    plugin.europeanaMenuWatermark = function() {
      $element.addClass(plugin.settings.extraclass);
      // console.log('inside public plugin', element, $element);
    };

    var _europeanaMenu_private_method = function() {
      // console.log('inside private plugin', element, $element);
    };

    plugin.init();
  };

  $.europeanaMenu.defaultOptions = {
    extraclass: 'has-menu'
    //,
    //onMenuChange: function() {},
    //onMenuLoad: function() {}
  };

  $.fn.europeanaMenu = function(options) {
    return this.each(function() {
      if (undefined == $(this).data('europeanaMenu')) {
        var plugin = new $.europeanaMenu(this, options);
        $(this).data('europeanaMenu', plugin);
      }
    });
  };

  $.fn.clearActivePath = function() {
    return this.each(function() {
      // remove all the .active links
      $('li').removeClass('active');
    });
  };

  $.fn.findActivePath = function() {
    return this.each(function() {
      // get the parent links
      var activeLink = $(this).find('.active');
      // add active class to all parent items
      if(activeLink.length>0) {
        $(this).data('hasActiveLink', true);
        $(activeLink).parents('li').addClass('active');
      }
    });
  };

}(jQuery, window, document));

$(document).ready(function() {

  // attach the plugin to an element
  $('#playmenu').findActivePath().europeanaMenu({
    'extraclass': 'has-europeana-menu'
  });

  // calculate how high the left play-menu needs to be.

  var level1Height = $('#playmenu li.toplevel.active').height()-28;
  //28: magic number, height of top item minus paddings. don't need that.
  // console.log('this submenu is ',level1Height, 'px high');
  $('ul#backlinks').height(level1Height);


  // a quick and dirty way to do inline page loads
  $('xx_dontuse_xx .play-menu .sub-menu a').each(function() {
    $(this).bind(
        'click touchend',
        function(e) {
          e.preventDefault();
          var target = $(this).attr('href');
          var title = $(this).text();
          var currentLi = $(this).parent();

          $('.play-menu').clearActivePath('active');
          // move selected item to top of menu
          currentLi.addClass('active');
          $('.play-menu').findActivePath('active');

          console.log('clicked link', target, title);

          // load the new page with ajax
          $('div.canvas').load(
              target + ' div.canvas > *',
              function( response, status, xhr ) {
                if ( status == "error" ) {
                  var msg = "Sorry but there was an error: ";
                  $('div.canvas main').html($('<div>').text( msg + xhr.status + " " + xhr.statusText ));
                }
              }
          );
          // add url to history
          history.pushState(null, title, target);
          document.title = title;
        }
    );
  });

  // custom breakpoints for menu, set to optimize menu
  var breakMenuFull = 60; //960
  var windowWidthEms = ((viewportSize.getWidth()) / 16);

});




