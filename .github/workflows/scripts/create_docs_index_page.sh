#!/bin/bash

make_page() {
    echo "<html><body><ul>"
    echo "<h1>OviPRO API Docs</h1>"
    got=
    while read -r line
    do
        printf "<li><a href="\"\/%s\"">%s</a></li>\n" "$line" "$line";
        got=1;
    done < <(sed 1d)
    [[ -z "$got" ]] && echo '<li>No files</li>'
    echo "</ul></body></html>"
}
[[ "$1" ]] && [[ ! -f "$1" ]] && { echo "no file $1" >&2; exit 1; }
[[ "$1" ]] && exec 3<"$1" || exec 3<&0
make_page <&3
