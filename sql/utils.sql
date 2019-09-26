-- ltree formating with unix paths

CREATE OR REPLACE FUNCTION public.formatPath (
  s char
)
  RETURNS ltree
  AS $BODY$
BEGIN
  RETURN text2ltree (REPLACE(REPLACE(REPLACE(REPLACE(s, 'ç', 'çç'), '-', 'ç1'), '.', 'ç0'), '/', '.'));
END;
$BODY$
LANGUAGE plpgsql
IMMUTABLE;

CREATE OR REPLACE FUNCTION public.formatPath (
  l ltree
)
  RETURNS char
  AS $BODY$
BEGIN
  RETURN REPLACE(REPLACE(REPLACE(REPLACE(ltree2text (l), '.', '/'), 'ç0', '.'), 'ç1', '-'), 'çç', 'ç');
END;
$BODY$
LANGUAGE plpgsql
IMMUTABLE;