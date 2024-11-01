<?php
$shortcodes = isset($shortcodes) ? $shortcodes : array();
?>
<div class="wrap tolvignetten">
    <h1 class="wp-heading-inline">Tolvignetten.nl plugin Configuration</h1>

    <ul class="tolvignetten-configuration-summary">
		<?php
		foreach ( $shortcodes as $shortcodeName => $shortcode ) {
			?>
            <li>
                <h3><?php echo $shortcode['name']; ?>:</h3>
                <ul>
                    <li>
                        <h4>Shortcode:</h4>
                        [<?php echo $shortcodeName; ?> ...]
                    </li>
                    <li>
                        <h4>Configuration parameters:</h4>
                        <table class="wp-list-tab striped">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Description</th>
                            </tr>
                            </thead>
                            <tbody>
							<?php
							foreach ( $shortcode['parameters'] as $key => $parameter ) {
								if( isset($parameter['hide_for_admin']) && true === $parameter['hide_for_admin'] ){
									continue;
								}

								$defaultValue = $parameter['default_value'];
								if ( \is_array( $defaultValue ) ) {
									$defaultValue = \implode( ', ', $defaultValue );
								}
                            ?>
                                <tr>
                                    <td>
										<?php echo $key; ?>
                                    </td>
                                    <td>
                                        <strong class="type">
                                            (<?php echo $parameter['type']; ?>)
                                        </strong>
                                    </td>
                                    <td>
										<?php
										if ( ! empty( $parameter['description'] ) ) {
											?>
                                            <p><?php echo $parameter['description']; ?></p><?php
										} ?>
                                        <p class="default-value">
                                            Default:
                                            "<span class="underline"><strong><?php echo \esc_attr( $defaultValue ); ?></strong></span>"
                                        </p>
                                    </td>
                                </tr>
								<?php
							} ?>
                            </tbody>
                        </table>
                    </li>
                    <li>
                        <h4>Examples:</h4>
                        <ul>
                            <li class="example">
                                [
								<?php
								echo $shortcodeName;
								foreach ( $shortcode['parameters'] as $key => $parameter ) {
									if( isset($parameter['hide_for_admin']) && true === $parameter['hide_for_admin'] ){
										continue;
									}

									$defaultValue = $parameter['default_value'];
									if ( \is_array( $defaultValue ) ) {
										$defaultValue = \implode( ', ', $defaultValue );
									} ?>
                                    <strong><?php echo $key; ?></strong>="<span class="underline"><?php echo \esc_attr( $defaultValue ); ?></span>"
									<?php
								} ?>
                                ]
                            </li>
                        </ul>
                    </li>
                </ul>
            </li>
            <li class="separator"></li>
			<?php
		}
		?>
    </ul>
</div>