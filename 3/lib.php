<?php

function delRecursive($items, $id, $stmt)
{
    foreach ($items as $item) {
        if ($item['parent_id'] == $id) {
            delRecursive($items, $item['id'], $stmt);
        }
        $stmt->execute([':id' => $id]);
    }
}

function getAllRecords($dbh)
{
    $sql    = 'SELECT id, parent_id, name FROM categories';
    $result = $dbh->query($sql);

    $rows = [];
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        $rows[] = $row;
    }
    return $rows;
}
