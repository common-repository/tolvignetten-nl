<?php
$textSelector = isset($textSelector) ? $textSelector : '';
$bgSelector = isset($bgSelector) ? $bgSelector : '';
$color = isset($color) ? $color : '';

echo $textSelector ?> {
    color: <?php echo $color; ?> !important;
}

<?php echo $textSelector ?> > a,
<?php echo $textSelector ?> nav > ul > li > a,
<?php echo $textSelector ?> nav > ul > li > ul > li > a,
<?php echo $textSelector ?> nav > ul > li > ul > li > ul > li > a,
<?php echo $textSelector ?> nav > ul > li > ul li a:hover,
<?php echo $textSelector ?> ul[class*="-social"] > li > a > i{
    color: <?php echo $color; ?> !important;
}

<?php echo $textSelector ?> .cmn-toggle-switch:before,
<?php echo $textSelector ?> .cmn-toggle-switch:after,
<?php echo $textSelector ?> .cmn-toggle-switch > span{
    background-color: <?php echo $color; ?> !important;
}

<?php echo $bgSelector ?>,
<?php echo $bgSelector ?> nav ul{
    background-color: <?php echo $color; ?> !important;
    -webkit-transition: none !important;
    -moz-transition: none !important;
    -ms-transition: none !important;
    -o-transition: none !important;
    transition: none !important;
}

<?php echo $bgSelector ?> nav > ul > li > ul li a:hover {
    background-color: <?php echo $color; ?> !important;
}