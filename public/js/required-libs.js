(function($){
    $(document).on('ready', function(){
        // Font Awesome
        var span = document.createElement('span');
        span.className = 'fa';
        span.style.display = 'none';
        document.body.insertBefore(span, document.body.firstChild);
        var exists = (window.getComputedStyle(span, null).getPropertyValue('font-family') === 'FontAwesome');
        document.body.removeChild(span);
        if ( !exists ) {        
            var head  = document.getElementsByTagName('head')[0];
            var link  = document.createElement('link');
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = TolvignettenPlugin.pluginUrl + '/public/css/fontawesome/css/all.min.css';
            link.media = 'all';
            head.appendChild(link);
        }

        // Bootstrap
        var span = document.createElement('span');
        span.className = 'clearfix';
        span.style.display = 'none';
        document.body.insertBefore(span, document.body.firstChild);
        var exists = (window.getComputedStyle(span, null).getPropertyValue('clear') === 'both');
        document.body.removeChild(span);
        if ( !exists ) {        
            var head  = document.getElementsByTagName('head')[0];
            var link  = document.createElement('link');
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = TolvignettenPlugin.pluginUrl + '/public/css/bootstrap-v3.3.6.min.css';
            link.media = 'all';
            head.appendChild(link);
        }

        // mCustomScrollbar
        if ( undefined === $.fn.mCustomScrollbar ) {
            var mCustomBarScript  = document.createElement('script');
            mCustomBarScript.type = 'text/javascript';
            mCustomBarScript.src = '//malihu.github.io/custom-scrollbar/jquery.mCustomScrollbar.concat.min.js';
            head.appendChild(mCustomBarScript);

            var mCustomBarCss  = document.createElement('link');
            mCustomBarCss.rel  = 'stylesheet';
            mCustomBarCss.type = 'text/css';
            mCustomBarCss.href = '//malihu.github.io/custom-scrollbar/jquery.mCustomScrollbar.min.css';
            mCustomBarCss.media = 'all';
            head.appendChild(mCustomBarCss);
        }
    });
})(jQuery);