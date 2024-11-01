<?php
$productsInformation = (false === empty($productsInformation)) ? $productsInformation : [];
foreach ($productsInformation as $countryIsoCode => $productsInfo) {
    ?>
    <li data-country-iso-code="<?php echo \esc_attr($countryIsoCode); ?>" class="product-item hide">
        <h5><?php echo $countryIsoCode; ?></h5>
        <ul>
            <?php
            foreach ($productsInfo as $productInfo) {
                ?>
                <li>
                    <h6><?php echo(false === empty($productInfo['title']) ? $productInfo['title'] : ''); ?></h6>
                    <p><?php echo(false === empty($productInfo['desc']) ? $productInfo['desc'] : ''); ?></p>
                </li>
                <?php
            }
            ?>
        </ul>
    </li>
    <?php
}