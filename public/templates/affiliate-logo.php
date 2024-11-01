<?php
$logoUrl = !empty($logoUrl) ? $logoUrl : '';
$linkAttrs = array('href'=>'href="javascript:void(0)"');
$imgAttrs = array();
if (!empty($targetUrl)) {
	$linkAttrs['href'] = \sprintf(
		'href="%s" target="_blank"',
		\esc_attr(
			$targetUrl
        )
	);

	$imgAttrs['alt'] = \sprintf(
		'alt="%s"',
		\esc_attr(
			$targetUrl
		)
	);
}
?>
<a class="ta-affiliate-logo" <?php echo \implode(' ', $linkAttrs); ?> style="margin-left:95px;margin-top:24px;position:absolute;box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;z-index:9999!important;">
    <img src="<?php echo $logoUrl; ?>" <?php echo \implode(' ', $imgAttrs); ?> style="height:21px;max-height:21px;width:94px;max-width:94px;">
</a>
