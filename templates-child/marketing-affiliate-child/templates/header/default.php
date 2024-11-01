<?php
/**
 * Header Template file
 *
 * @package marketing
 * @since 1.0
 */
?>

<!-- HEADER -->
<header class="tt-header">
  <div class="container">
    <div class="top-inner clearfix">
      <div class="ta-partner-logo-wrapper top-inner-container">
        <?php
        $domain = 'tolvignetten';
        if (false !== \stripos($_SERVER['HTTP_HOST'], 'vignetoostenrijk')) {
            $domain = 'vignetoostenrijk';
        }
        else if (false !== \stripos($_SERVER['HTTP_HOST'], 'vignetteoesterreich.de')) {
            $domain = 'vignetteoesterreich';
        }
        else if (false !== \stripos($_SERVER['HTTP_HOST'], 'vignette-autriche.fr')) {
            $domain = 'vignette-autriche-fr';
        }
        else if (false !== \stripos($_SERVER['HTTP_HOST'], 'vignetvooroostenrijk.be')) {
            $domain = 'vignetvooroostenrijk-be';
        }
        else if (false !== \stripos($_SERVER['HTTP_HOST'], 'vignetteoesterreich.ch')) {
            $domain = 'vignetteoesterreich-ch';
        }
        else if (false !== \stripos($_SERVER['HTTP_HOST'], 'vignette-austria.co.uk')) {
            $domain = 'vignette-austria-co-uk';
        }
        else if (false !== \stripos($_SERVER['HTTP_HOST'], 'vignetta-austria.it')) {
            $domain = 'vignetta-austria-it';
        }

        if (tolvignetten_print_has_logo()) {
            ?>
            <a href="<?php echo esc_url(home_url('/')); ?>" class="logo">
                <img src="<?php echo get_template_directory_uri() . '/../marketing-affiliate-child/img/' . $domain . '-ism.svg'; ?>"/>
            </a>
            <?php
            if (\function_exists('tolvignetten_print_logo_html')) {
                tolvignetten_print_logo_html();
            }
        } else {
            marketing_logo('logo', get_template_directory_uri() . '/../marketing-affiliate-child/img/' . $domain . '.svg');
        }
        ?>
        <button class="cmn-toggle-switch"><span></span></button>
      </div>
    </div>
    <div class="toggle-block">
      <div class="toggle-block-container">
        <nav class="main-nav clearfix">
          <?php marketing_main_menu(); ?>
        </nav>
        <div class="nav-more social-module">
          <ul class="tt-social clearfix header-social-icons">
            <?php marketing_social_links('%s', marketing_get_opt('header-social-icons-category')); ?>
          </ul>
        </div>
      </div>
    </div>
  </div>
</header>
<?php marketing_header_height(marketing_get_opt('header-height-switch')); ?>
