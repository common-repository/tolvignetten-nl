<?php

/**
 * Plugin Name: Tolvignetten.nl
 * Description: This plugin is used to integrate Tolvignetten.nl in your wordpress website. For partnerships, please conact contact@tolvignetten.nl
 * Author: Randock Webdevelopment SL
 * Author URI: https://randock.com/
 * Version: 1.0.66
 */

\defined('ABSPATH') or die;
\define('TOLVIGNETTEN_PLUGIN_VERSION', '1.0.66');

require_once \sprintf(
	'%ssettings.php',
	\plugin_dir_path(__FILE__)
);

require_once \sprintf(
	'%sincludes/functions.php',
	TOLVIGNETTEN_PATH
);

require_once \sprintf(
	'%sincludes/ajax.php',
	TOLVIGNETTEN_PATH
);

if (\is_admin()) {
	require_once \sprintf(
		'%sadmin/admin.php',
		TOLVIGNETTEN_PATH
	);
} else {
	require_once \sprintf(
		'%spublic/public.php',
		TOLVIGNETTEN_PATH
	);
}

\register_activation_hook(__FILE__, 'tolvignetten_install');
function tolvignetten_install()
{
	$childTemplates = tolvignetten_get_templates_child_file_list();
	if (!empty($childTemplates)) {
		$themesPath = tolvignetten_get_root_themes_path();
		foreach ($childTemplates as $childTemplateDir) {
			$targetPath = \sprintf(
				"%s/%s",
				$themesPath,
				\basename($childTemplateDir)
			);

			if (\is_dir($targetPath)) {
				tolvignetten_rmdir(
					$targetPath
				);
			}

			tolvignetten_copy(
				$childTemplateDir,
				$targetPath
			);
		}
	}
}

\register_uninstall_hook(__FILE__, 'tolvignetten_uninstall');
function tolvignetten_uninstall()
{
	$childTemplates = tolvignetten_get_templates_child_file_list();
	if (!empty($childTemplates)) {
		$themesPath = tolvignetten_get_root_themes_path();
		foreach ($childTemplates as $childTemplateDir) {
			$targetPath = \sprintf(
				"%s/%s",
				$themesPath,
				\basename($childTemplateDir)
			);

			if (\is_dir($targetPath)) {
				tolvignetten_rmdir(
					$targetPath
				);
			}
		}
	}
}
