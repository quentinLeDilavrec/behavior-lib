#!/usr/bin/env bash
# inspired from Robert Siemer post, https://stackoverflow.com/a/29754866

# saner programming env: these switches turn some bugs into errors
set -o errexit -o pipefail -o noclobber -o nounset

# -allow a command to fail with !’s side effect on errexit
# -use return value from ${PIPESTATUS[0]}, because ! hosed $?
! getopt --test > /dev/null 
if [[ ${PIPESTATUS[0]} -ne 4 ]]; then
    echo 'I’m sorry, `getopt --test` failed in this environment.'
    exit 1
fi

OPTIONS=dfo:v
LONGOPTS=debug,force,output:,verbose

# -regarding ! and PIPESTATUS see above
# -temporarily store output to be able to check for errors
# -activate quoting/enhanced mode (e.g. by writing out “--options”)
# -pass arguments only via   -- "$@"   to separate them correctly
! PARSED=$(getopt --options=$OPTIONS --longoptions=$LONGOPTS --name "$0" -- "$@")
if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    # e.g. return value is 1
    #  then getopt has complained about wrong arguments to stdout
    exit 2
fi
# read getopt’s output this way to handle the quoting right:
eval set -- "$PARSED"

custom=n r=always u=root p=password n=mydb pp=8080 ap=5432

# now enjoy the options in order and nicely split until we see --
while true; do
    case "$1" in
        -r|--restart)
            r="$2"
            custom=y
            shift 2
            ;;
        -u|--user)
            u="$2"
            custom=y
            shift 2
            ;;
        -p|--password)
            p="$2"
            custom=y
            shift 2
            ;;
        -n|--database-name)
            n="$2"
            custom=y
            shift 2
            ;;
        -pp|--postgres-port)
            pp="$2"
            custom=y
            shift 2
            ;;
        -ap|--adminer-port)
            ap="$2"
            custom=y
            shift 2
            ;;
        # -o|--output)
        #     outFile="$2"
        #     shift 2
        #     ;;
        --)
            shift
            break
            ;;
        *)
            echo "Programming error"
            exit 3
            ;;
    esac
done

# handle non-option arguments
if [[ $# -ne 0 ]]; then
    echo "$0: A single input file is required."
    exit 4
fi

echo "u: $u, p: $p, n: $n, pp: $pp, ap: $ap, r:$r, custom:$custom"



if [[ $custom == "y" ]]; then
    echo 777
    POSTGRES_USER=$u POSTGRES_PASSWORD=$p POSTGRES_DB=$n \
    POSTGRES_PORT=$pp ADMINER_PORT=$ap \
    RESTART=$r \
    docker-compose up
else
    docker-compose -f docker-compose.default.yml up
fi

# TODO setup tables and functions