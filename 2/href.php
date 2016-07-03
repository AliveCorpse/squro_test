<?php
/*
 * 2. Напишите php скрипт который будет запускаться из консоли.
 * Команда php нашскрипт.php http://где.то/там/ выводит все ссылки (href атрибуты тега <a>), которые есть * на странице http://где.то/там/.
 * Url должны преобразовываться к абсолютной форме, дубликатов быть не должно.
 */

error_reporting(E_ALL);

function uri2absolute($link, $base)
{
    if (!preg_match('~^(http://[^/?#]+)?([^?#]*)?(\?[^#]*)?(#.*)?$~i', $link . '#', $matchesLink)) {
        return false;
    }
    if (!empty($matchesLink[1])) {
        return $link;
    }
    if (!preg_match('~^(http://)?([^/?#]+)(/[^?#]*)?(\?[^#]*)?(#.*)?$~i', $base . '#', $matchesBase)) {
        return false;
    }
    if (empty($matchesLink[2])) {
        if (empty($matchesLink[3])) {
            return 'http://' . $matchesBase[2] . $matchesBase[3] . $matchesBase[4];
        }
        return 'http://' . $matchesBase[2] . $matchesBase[3] . $matchesLink[3];
    }
    $pathLink = explode('/', $matchesLink[2]);
    if ($pathLink[0] == '') {
        return 'http://' . $matchesBase[2] . $matchesLink[2] . $matchesLink[3];
    }
    $pathBase = explode('/', preg_replace('~^/~', '', $matchesBase[3]));
    if (sizeOf($pathBase) > 0) {
        array_pop($pathBase);
    }
    foreach ($pathLink as $p) {
        if ($p == '.') {
            continue;
        } elseif ($p == '..') {
            if (sizeOf($pathBase) > 0) {
                array_pop($pathBase);
            }
        } else {
            array_push($pathBase, $p);
        }
    }
    return 'http://' . $matchesBase[2] . '/' . implode('/', $pathBase) . $matchesLink[3];
}

function parseSite($url)
{
    libxml_use_internal_errors(true);

    $html = file_get_contents($url);

    $dom = new DOMDocument;
    $dom->loadHTML($html);

    $a_tags = $dom->getElementsByTagName('a');

    $result = [];
    foreach ($a_tags as $tag) {
        $result[] = uri2absolute($tag->getAttribute('href'), $url);
    }

    return array_unique($result);
}

print_r(parseSite($argv[1]));
