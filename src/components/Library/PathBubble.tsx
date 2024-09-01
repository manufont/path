/** @jsxImportSource @emotion/react */

import styled from "@emotion/styled";
import { css, useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import { StoredPath } from "contexts/Library";
import { getSvgPath } from "contexts/Library/utils";
import { Path } from "hooks/usePath";
import { Typography } from "@mui/material";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { SerializedStyles } from "@emotion/react";

const Root = ({
  path,
  onClick,
  children,
  ...otherProps
}: Pick<PathBubbleProps, "path" | "onClick"> &
  Pick<React.HTMLProps<HTMLElement>, "onMouseOver" | "onMouseLeave"> & {
    css: SerializedStyles;
    children: React.ReactNode;
  }) => {
  if (onClick || !("pathSearch" in path)) {
    return (
      <RootDiv {...otherProps} onClick={onClick}>
        {children}
      </RootDiv>
    );
  }

  return (
    <RootLink {...otherProps} to={path.pathSearch}>
      {children}
    </RootLink>
  );
};

const getBackgroundColor = (darkTheme: boolean) => (darkTheme ? "#2d311c" : "#e4f0cc");
const getBorderColor = (darkTheme: boolean, isHovered: boolean, isCurrentPath = false) =>
  darkTheme
    ? isCurrentPath
      ? "white"
      : isHovered
      ? "rgba(255, 255, 255, 0.60)"
      : "rgba(255, 255, 255, 0.23)"
    : isCurrentPath
    ? "rgba(0, 0, 0, 0.87)"
    : isHovered
    ? "rgba(0, 0, 0, 0.60)"
    : "rgba(0, 0, 0, 0.23)";

const formatPathDistance = (path: Path) => {
  const { length } = path.trip.summary;
  if (length >= 0.95) {
    return Math.round(length) + "k";
  }
  return length.toFixed(1) + "k";
};

type PathBubbleProps = {
  path: Path | StoredPath;
  currentPath?: Path | null;
  onClick?: (e: React.MouseEvent) => void;
  showAddButton?: boolean;
  hoveredPathId: string | null;
  setHoveredPathId?: (path: string | null) => void;
  size?: number;
};

const PathBubble = ({
  path,
  currentPath,
  onClick,
  showAddButton,
  hoveredPathId,
  setHoveredPathId,
  size = 44,
}: PathBubbleProps) => {
  const points = "svgPath" in path ? path.svgPath : getSvgPath(path);
  const theme = useTheme();
  const darkTheme = theme.palette.mode === "dark";
  const [startX, startY] = points.split(" ")[0].split(",").map(parseFloat);

  const isHovered = hoveredPathId === path.id;
  const isCurrentPath = currentPath?.id === path.id;
  const onMouseOver = () => {
    setHoveredPathId && setHoveredPathId(path.id);
  };
  const onMouseLeave = () => {
    if (hoveredPathId === path.id && setHoveredPathId) {
      setHoveredPathId(null);
    }
  };

  useEffect(
    () => () => {
      onMouseLeave();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Root
      path={path}
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      css={css`
        ${isHovered
          ? `
            transform: scale(1.1);
          `
          : ""}
      `}
    >
      <StyledSvg viewBox="-0.4 -0.4 1.8 1.8" width={size} height={size} onClick={onClick}>
        <circle
          className="outline"
          cx={0.5}
          cy={0.5}
          r={0.85}
          stroke={getBorderColor(darkTheme, isHovered, isCurrentPath)}
          fill={getBackgroundColor(darkTheme)}
          stroke-width={0.03}
        />
        <polyline points={points} fill="none" stroke="#00bcd4" strokeWidth={0.1}></polyline>
        <circle
          cx={startX}
          cy={startY}
          r={0.12}
          stroke="#00000080"
          fill="white"
          strokeWidth={0.2}
          paint-order="stroke"
        />
      </StyledSvg>
      <DistanceText variant="button">{formatPathDistance(path)}</DistanceText>
      {showAddButton && (
        <SideIcon
          className="side-icon"
          fontSize="inherit"
          css={css`
            background-color: ${getBackgroundColor(darkTheme)};
            border: 1px solid ${getBorderColor(darkTheme, isHovered)};
            ${isHovered
              ? `
                  font-size: 24px;
                  margin: -2px;
                `
              : ""};
          `}
        />
      )}
    </Root>
  );
};

const StyledSvg = styled.svg`
  display: block;
`;

const SideIcon = styled(AddIcon)`
  position: absolute;
  top: -2px;
  right: -2px;
  border-radius: 50%;
  font-size: 20px;
  border: 1;
`;

const RootDiv = styled.div`
  position: relative;
  transition: transform 0.3s ease;
`;

const RootLink = styled(Link)`
  position: relative;
  transition: transform 0.3s ease;
  text-decoration: none;
  color: inherit;
  display: block;
`;

const DistanceText = styled(Typography)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-weight: bold;
  font-size: 10px;
`;

export default PathBubble;
