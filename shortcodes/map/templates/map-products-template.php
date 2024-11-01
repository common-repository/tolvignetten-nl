<div class="mCustomScrollbar map-height" style="max-height: 600px" data-mcs-theme="minimal-dark">
    <div class="ta-map-details-column-wrapper">
        <h3>BENODIGDE VIGNETTEN</h3>
        <div class="text init-text hide">
            <p>
                Vul hiernaast uw vertrekpunt en bestemming in en wij tonen u de benodigde vignetten.
                Zo simpel is het. U kunt de vignetten natuurlijk ook direct bestellen.
            </p>
        </div>
        <div class="text route-text hide">
            <p>Deze route beslaat <span class="route-distance"></span> en de reistijd bedraagt ongeveer
                <span class="route-duration"></span>.</p>
            <p>
                Hieronder ziet u de producten die u nodig heeft voor uw reis. Klik op ‘bekijk en bestel deze producten’
                om de producten in één keer te bestellen. Indien u producten reeds in uw bezit heeft, kunt u deze later
                in het bestelproces verwijderen.
            </p>
        </div>
        <div class="h-preloader hide">
            <img src="<?php echo \tolvignetten_plugin_url('public/images/h-preloader.svg'); ?>"/>
        </div>
        <div class="message hide">Geen producten gevonden voor deze route.</div>
        <div class="buttons hide">
            <a href="javascript:void(0);" class="btn continue-button">Bekijk en bestel deze producten »</a>
        </div>
        <ul>
            <?php include 'map-products-template-items.php'; ?>
        </ul>
        <div class="buttons hide">
            <a href="javascript:void(0);" class="btn continue-button">Bekijk en bestel deze producten »</a>
        </div>
    </div>
</div>
