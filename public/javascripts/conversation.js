  function add_contact_hide_keyup(ev)
  {
    if (ev.keyCode == 27){ // Escape key
        $('#add_avatar_container').animate({ opacity: "hide" },200);
        $(document).unbind('click');
        $(document).unbind('keyup');
    }
    if (ev.keyCode == 13){ // Enter key
        $('.contact_list_new ul li:not(.hiding):first .right.add_delete_button span a:not(.hiding)').click()
    }
  }
  function add_contact_hide(ev)
    {
      el = $('#add_avatar_container');
      pos = $('#add_avatar_container').offset();
      shadow_size = 12;
      if (!(ev.pageX >= pos.left &&
        ev.pageX <= (pos.left + el[0].clientWidth) &&
        ev.pageY >= (pos.top - shadow_size) &&
        ev.pageY <= (pos.top + el[0].clientHeight + shadow_size)))
      {
        $('#add_avatar_container').animate({ opacity: "hide" },200);
        $(document).unbind('click');
        $(document).unbind('keyup');
      }
    }
  function change_contact(people_id,url_path,people_url,it,class_name)
    {
        g = $.ajax({url:url_path,async:false,cache:false,type:'POST'});
        if (g.status == 200)
        {
            if (g.responseText.indexOf('O') != -1)
            {
              $(it).parent().parent().parent().find('.right.owner_button span a').addClass('hiding');
              $(it).parent().parent().parent().find('.right.owner_button span a.remove_owner').removeClass('hiding');
            }
            else
            {
              $(it).parent().parent().parent().find('.right.owner_button span a').addClass('hiding');
              $(it).parent().parent().parent().find('.right.owner_button span a.add_owner').removeClass('hiding');
            }

            if (g.responseText.indexOf('E') != -1)
            {
              $(it).parent().parent().parent().find('.right.edit_button span a').addClass('hiding');
              $(it).parent().parent().parent().find('.right.edit_button span a.remove_editor').removeClass('hiding');
            }
            else
            {
              $(it).parent().parent().parent().find('.right.edit_button span a').addClass('hiding');
              $(it).parent().parent().parent().find('.right.edit_button span a.add_editor').removeClass('hiding');
            }

            if (g.responseText.indexOf('R') != -1)
            {
               al_have = false;
                $('div.span-6.avatars.last a').each(function(indx,itm){
                    if ($(itm).find('img').data('person_id') == people_id)
                    {
                        al_have = true;
                        if ($(itm).hasClass('avatar_hiding'))
                        {
                            $(itm).animate({opacity:1.0},500);
                            $(itm).removeClass('avatar_hiding');
                        }
                    }
                });
                if (!al_have)
                {
                    $('div.span-6.avatars.last').append(g.responseText);
                }
              $(it).parent().parent().parent().find('.right.add_delete_button span a').addClass('hiding');
              $(it).parent().parent().parent().find('.right.add_delete_button span a.remove').removeClass('hiding');
            }
            else
            {
              $(it).parent().parent().parent().find('.right.add_delete_button span a').addClass('hiding');
              $(it).parent().parent().parent().find('.right.add_delete_button span a.add').removeClass('hiding');
               $('div.span-6.avatars.last a').each(function(indx,itm){
                    if ($(itm).find('img').data('person_id') == people_id)
                    {
                        $(itm).animate({opacity:0.5},500);
                        $(itm).addClass('avatar_hiding');
                    }
                });
            }
            if (class_name == 'remove_owner')
            {
                $(it).parent().parent().parent().find('.right.edit_button span a').addClass('hiding');
                $(it).parent().parent().parent().find('.right.edit_button span a.remove_editor').removeClass('hiding');
                $(it).parent().parent().parent().find('.right.add_delete_button span a').addClass('hiding');
                $(it).parent().parent().parent().find('.right.add_delete_button span a.remove').removeClass('hiding');
            }
            if (class_name == 'remove_editor')
            {
                $(it).parent().parent().parent().find('.right.add_delete_button span a').addClass('hiding');
                $(it).parent().parent().parent().find('.right.add_delete_button span a.remove').removeClass('hiding');
            }
            $('div.span-6.avatars.last a').each(function(indx,itm){
              if ($(itm).find('img').data('person_id') == people_id)
              {
                $(itm).removeClass('no_highlight');
                $(itm).removeClass('editor_highlight');
                $(itm).removeClass('owner_highlight');
                if (g.responseText.indexOf('O')!=-1)
                {
                    $(itm).addClass('owner_highlight');
                }
                else
                {
                    if (g.responseText.indexOf('E')!=-1)
                    {
                        $(itm).addClass('editor_highlight');
                    }
                    else
                    {
                        if (g.responseText.indexOf('R')!=-1)
                        {
                            $(itm).addClass('no_highlight');
                        }
                    }
                }
              }
            });
        }
    }