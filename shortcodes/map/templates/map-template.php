<div class="map-container tolvignetten">
    <div class="map-form-container">
        <form class="main-search border-less-inputs inputs-2" name="map_form">
            <input type="hidden" name="countries" value=""/>
            <input type="hidden" name="tolls" value=""/>

            <div class="map-row">
                <div class="form-group pull-right button-group">
                    <button type="button" class="btn btn-default continue-btn">
                        <span>Continue</span>
                        <i class="fa fa-arrow-right"></i>
                    </button>
                </div>

                <div class="form-group pull-left collapse-button-group">
                    <a href="javascript:void(0);" class="btn btn-default toggle-products">
                        <i class="fa fa-bars"></i>
                        <i class="fa fa-times"></i>
                    </a>
                </div>

                <div class="form-group pull-left input-group origin-group">
                    <input type="text"
                           class="form-control"
                           id="start"
                           placeholder="Vertrekpunt"
                           value="Utrecht, Nederland"
                           autocomplete="off"/>
                </div>

                <div class="form-group pull-left input-group destination-group">
                    <input type="text"
                           class="form-control"
                           id="end"
                           value=""
                           placeholder="Bestemming"
                           autocomplete="off"/>
                </div>

                <div class="clearfix"></div>
            </div>
        </form>

        <div class="ta-map-preload hide">
            <img src="<?php echo \tolvignetten_plugin_url('public/images/map-preload.svg'); ?>" style="margin-right:5px;"/>
            <span>Loading...</span>
        </div>
    </div>

    <a href="javascript:void(0)" class="display-mode-btn" data-mode="list">
        <i class="fa fa-bars"></i>
        Product list
    </a>

    <a href="javascript:void(0)" class="display-mode-btn" data-mode="map">
        <i class="fa fa-map-signs"></i>
        Map viewer
    </a>

    <div id="map" class="map-height"></div>
</div>

<div class="mobile-list-mode-container map-height">
    <?php include 'map-products-template.php'; ?>
</div>
