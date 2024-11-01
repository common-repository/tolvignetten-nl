<?php
$href = 'javascript:void(0)';
if (!empty($target_path)) {
    $href = $target_path;
}

$_classes = array(
    'tolvignetten',
    'tolvignetten-cart-button',
);

$itemsNumber = isset($itemsNumber) ? $itemsNumber : 0;
$isEmpty = empty($itemsNumber);
if ($isEmpty) {
    $_classes[] = 'empty';
}

$_badget_classes = array(
    'badge',
    'badge-pill',
    'animated bounce',
);

if ($isEmpty) {
    $_badget_classes[] = 'hide';
}

$styleAttr = '';
if (!empty($style)) {
    $styleAttr = \sprintf(
        'style="%s"',
        $style
    );
}

$iconStyleAttr = '';
if (!empty($icon_style)) {
    $iconStyleAttr = \sprintf(
        'style="%s"',
        $icon_style
    );
}
?>
<a class="<?php echo \implode(' ', $_classes); ?>" <?php echo $styleAttr; ?>
   href="<?php echo $href; ?>">
    <span class="<?php echo \implode(' ', $_badget_classes); ?>">
        <?php
        if (!$isEmpty && $itemsNumber > 99) {
            $itemsNumber = 99;
            echo '+';
        }
        echo (int) $itemsNumber;
        ?>
    </span>
    <i class="fa fa-shopping-cart" <?php echo $iconStyleAttr; ?>></i>
</a>