<?php
$content_types = [
  'apps' => 'bolt_data',
  'posts' => 'bolt_posts',
  'collections' => 'bolt_pages',
  'data' => 'bolt_data',
  'documentation' => 'bolt_data',
  'events' => 'bolt_events',
  'footers' => 'bolt_footers',
  'jobs' => 'bolt_jobs',
  'pages' => 'bolt_pages',
  'pressreleases' => 'bolt_posts',
  'projects' => 'bolt_projects',
  'persons' => 'bolt_persons',
  'publications' => 'bolt_posts',
  'resources' => 'bolt_resources',
  'structures' => 'bolt_pages',
  'taskforces' => 'bolt_projects'
];

$ct_mergers = [
  'apps' => 'pages',
  'blogposts' => 'posts',
  'collections' => 'pages',
  'publications' => 'posts',
  'pressreleases' => 'posts',
  'documentation' => 'data',
  'taskforces' => 'projects',
  'pro-structures' => 'pages',
  'labs-structures' => 'pages',
  'research-structures' => 'pages'
];

$query['intro'][] = "USE europeana_cope;\n";

foreach ($content_types as $ctype => $table) {
  $query['relations_from'][] = "UPDATE bolt_relations r, $table x SET r.from_id = x.id WHERE x.subsite_id = r.from_id AND x.subsite = r.subsite AND r.from_contenttype = '$ctype';\n";

  $query['relations_to'][] = "UPDATE bolt_relations r, $table x SET r.to_id = x.id WHERE x.subsite_id = r.to_id AND x.subsite = r.subsite AND r.to_contenttype = '$ctype';\n";
}

foreach ($ct_mergers as $oldct => $newct) {
  $query['relations_ct_from'][] = "UPDATE bolt_relations r SET r.to_contenttype = '$newct' WHERE r.to_contenttype = '$oldct';\n";

  $query['relations_ct_from'][] = "UPDATE bolt_relations r SET r.to_contenttype = '$newct' WHERE r.to_contenttype = '$oldct';\n";
}


foreach ($content_types as $ctype => $table) {
  $query['taxonomy'][] = "UPDATE bolt_taxonomy t, $table c SET t.content_id = c.id WHERE c.subsite_id = t.content_id AND c.subsite = t.subsite AND t.contenttype = '$ctype';\n";
}

// set username
foreach ($content_types as $ctype => $table) {
  $query['usernames'][] = "UPDATE $table c, bolt_users u SET c.username = u.username WHERE u.subsite_id = c.ownerid AND c.subsite = u.subsite;\n";
}

// remove duplicate users by username

$query['user_dedupe'][] = "UPDATE bolt_users u, bolt_users u2
SET
  u.username = concat('dupe-', u.subsite, '-', u.subsite_id, '-', u.username),
  u.email = concat('dupe-', u.subsite, '-', u.subsite_id, '-', u.email)
WHERE
  u.id <> u2.id
  AND u.username = u2.username
  AND u.id > u2.id;
";

$query['user_dedupe'][] = "UPDATE bolt_users u, bolt_users u2
SET
  u.email = concat('dupe-', u.email)
WHERE
  u.id <> u2.id
  AND u.email = u2.email
  AND u.id > u2.id;
";

$query['user_dedupe'][] = "DELETE FROM bolt_users WHERE username like 'dupe-%';\n";

// set userid
foreach ($content_types as $ctype => $table) {
  $query['user_id'][] = "UPDATE $table c, bolt_users u SET c.ownerid = u.id WHERE c.username = u.username;\n";
}

$query['cleanup'][] = "ALTER TABLE bolt_relations DROP subsite;\n";
$query['cleanup'][] = "ALTER TABLE bolt_taxonomy DROP subsite;\n";
$query['cleanup_id'][] = "ALTER TABLE bolt_relations DROP subsite_id;\n";
$query['cleanup_id'][] = "ALTER TABLE bolt_taxonomy DROP subsite_id;\n";

foreach ($content_types as $ctype => $table) {
    $query['cleanup_id'][$table] = "ALTER TABLE $table DROP subsite_id;\n";
}

foreach ($query as $group => $queries) {
    echo "-- queries for $group\n";
    foreach ($queries as $doit) {
        echo $doit;
    }

}
