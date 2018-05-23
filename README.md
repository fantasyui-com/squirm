# squirm
Css Color Processing Library

## Features
Squirm uses postcss-scss syntax

## Constraints

HTML color name limitations. Squirm messes with colors, therefore do not expect html color names to be returned.
For example ```.red-class {color: red;}``` CANNOT be converted to another HTML color name
it will be returned as an rgb() by default (see format param)
