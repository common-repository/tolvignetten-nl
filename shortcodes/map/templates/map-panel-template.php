<?php
$productsInformation = (false === empty($productsInformation)) ? $productsInformation : [];
$products_panel = (isset($products_panel) && 'true' === $products_panel);

$taMapWidgetClassess = array('ta-map-widget');
if( true === $products_panel ){
	$taMapWidgetClassess[] = 'opened';
}
else{
	$taMapWidgetClassess[] = 'without-products';
}

$attrs = array();
if( !empty($header_selectors) ){
	$attrs[] = \sprintf(
		'data-header-selectors="%s"',
		\esc_attr(
			$header_selectors
		)
	);
}
?>
<div class="<?php echo \implode(' ', $taMapWidgetClassess); ?>" <?php echo \implode(' ', $attrs) ?>>
    <div class="container-fluid ta-map-wrapper">
        <div class="row">
            <?php if( true === $products_panel ){ ?>
                <div class="ta-map-details-column col" style="float:left;">
                    <?php include 'map-products-template.php'; ?>
                </div>
			<?php } ?>
            <div class="ta-map-column display-mode-map">
				<?php include 'map-template.php'; ?>
            </div>
        </div>
    </div>
    <div class="ta-map-simulated-spacing"></div>
</div>
