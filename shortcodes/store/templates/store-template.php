<?php
$iframeExtraAttrs = array();

if (!empty($locale)) {
    $iframeExtraAttrs[] = \sprintf(
        'data-locale="%s"',
        \esc_attr(
            $locale
        )
    );
}

if (!empty($partner_id)) {
	$iframeExtraAttrs[] = \sprintf(
		'data-partner-id="%s"',
		\esc_attr(
			$partner_id
		)
	);
}

if (!empty($partner_info)) {
	$iframeExtraAttrs[] = \sprintf(
		'data-partner-info="%s"',
		\esc_attr(
			$partner_info
		)
	);
}

if (!empty($partner_anvr)) {
	$iframeExtraAttrs[] = \sprintf(
		'data-partner-anvr="%s"',
		\esc_attr(
			$partner_anvr
		)
	);
}

if (!empty($partner_bdr)) {
	$iframeExtraAttrs[] = \sprintf(
		'data-partner-bdr="%s"',
		\esc_attr(
			$partner_bdr
		)
	);
}

if (!empty($vehicle)) {
	$iframeExtraAttrs[] = \sprintf(
		'data-vehicle="%d"',
		\esc_attr(
			$vehicle
		)
	);
}

if (!empty($start_date)) {
	$iframeExtraAttrs[] = \sprintf(
		'data-start-date="%s"',
		\esc_attr(
			$start_date
		)
	);
}

if (!empty($end_date)) {
	$iframeExtraAttrs[] = \sprintf(
		'data-end-date="%s"',
		\esc_attr(
			$end_date
		)
	);
}

if (!empty($license_plate_number)) {
	$iframeExtraAttrs[] = \sprintf(
		'data-license-plate-number="%s"',
		\esc_attr(
			$license_plate_number
		)
	);
}

if (!empty($currency)) {
    $iframeExtraAttrs[] = \sprintf(
        'data-currency="%s"',
        \esc_attr(
            $currency
        )
    );
}
?>
<div class="tolvignetten">
    <img src="<?php echo \tolvignetten_plugin_url('public/images/loader.gif'); ?>"
         id="spinner"
         class="preloader"/>

    <iframe name="tolvignetten_store_iframe"
            id="product_frame"
            src="about:blank"
            height="2000"
		<?php echo \implode(' ', $iframeExtraAttrs); ?>>
    </iframe>
</div>
