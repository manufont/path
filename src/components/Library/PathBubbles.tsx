/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { StoredPath } from "contexts/Library";
import { Path } from "hooks/usePath";
import PathBubble from "./PathBubble";
import { useState, useRef, useEffect } from "react";
import { css, useTheme } from "@mui/material/styles";
import { useMounted } from "hooks";

const BUBBLE_TRANSITION_SIZE = 100;

const BubbleWrapper = ({
  path,
  currentPath,
  ...otherProps
}: Omit<PathBubblesProps, "paths"> & { path: StoredPath }) => {
  const mounted = useMounted();

  const isHovered = otherProps.hoveredPathId === path.id;
  const isCurrentPath = currentPath?.id === path.id;

  return (
    <BubbleWrapperRoot
      id={`path-${path.id}`}
      mounted={mounted}
      isHovered={isHovered}
      isCurrentPath={isCurrentPath}
    >
      <PathBubble currentPath={currentPath} {...otherProps} path={path} />
    </BubbleWrapperRoot>
  );
};

type PathBubblesProps = {
  currentPath: Path | null;
  paths: StoredPath[];
  hoveredPathId: string | null;
  setHoveredPathId: (path: string | null) => void;
};

const EDGE_WIDTH = 30;
const WHEEL_SCROLL_FACTOR = 3;

const PathBubbles = ({ paths, currentPath, ...otherProps }: PathBubblesProps) => {
  const theme = useTheme();
  const darkTheme = theme.palette.mode === "dark";
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [scaleEdgeRight, setScaleEdgeRight] = useState(0);
  const [scaleEdgeLeft, setScaleEdgeLeft] = useState(0);

  const onScroll = () => {
    if (!scrollRef.current) return;
    const { scrollWidth, clientWidth, scrollLeft } = scrollRef.current;
    const hiddenWidthRight = scrollWidth - clientWidth - scrollLeft;
    setScaleEdgeRight(Math.min(hiddenWidthRight / EDGE_WIDTH, 1));
    setScaleEdgeLeft(Math.min(scrollLeft / EDGE_WIDTH, 1));
  };

  const onScrollWheel = (e: WheelEvent) => {
    const scrollElt = scrollRef.current;
    if (!scrollElt) return;
    scrollElt.scrollLeft += e.deltaY / WHEEL_SCROLL_FACTOR;
  };

  useEffect(() => {
    const scrollElt = scrollRef.current;
    if (!scrollElt) return;
    const observer = new ResizeObserver(onScroll);
    observer.observe(scrollElt);
    scrollElt.addEventListener("wheel", onScrollWheel);
    return () => {
      observer.disconnect();
      scrollElt.removeEventListener("wheel", onScrollWheel);
    };
  }, []);

  const currentPathIsStored = currentPath && paths.find(({ id }) => id === currentPath.id);

  useEffect(() => {
    const scrollElt = scrollRef.current;
    if (!currentPath || !scrollElt) return;
    // we auto scroll on the current path if present
    const pathBubble = document.getElementById(`path-${currentPath.id}`);
    if (!pathBubble) return;
    pathBubble.scrollIntoView();
    scrollElt.scrollLeft -= BUBBLE_TRANSITION_SIZE; // we shift by 100 to compensate for the translateX
  }, [currentPath, currentPathIsStored]);

  return (
    <Root
      css={css`
        --gradient-from: ${darkTheme ? "#1e1e1e00" : "#fff0"};
        --gradient-to: ${darkTheme ? "#1e1e1eff" : "#ffff"};
      `}
    >
      <ScrollablePart ref={scrollRef} onScroll={onScroll}>
        {paths.map((path) => (
          <BubbleWrapper key={path.id} path={path} currentPath={currentPath} {...otherProps} />
        ))}
      </ScrollablePart>
      <EdgeRight
        css={css`
          transform: scaleX(${scaleEdgeRight});
        `}
      />
      <EdgeLeft
        css={css`
          transform: scaleX(${scaleEdgeLeft});
        `}
      />
    </Root>
  );
};

const Root = styled.div`
  flex: 1;
  position: relative;
  height: 100%;
`;

const ScrollablePart = styled.div`
  padding: 4px;
  margin: -4px; // We add margin for bubble transform scale effect
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  scrollbar-width: none;
`;

const Edge = styled.div`
  position: absolute;
  width: ${EDGE_WIDTH}px;
  top: -4px;
  bottom: -4px;
`;

const EdgeRight = styled(Edge)`
  right: -4px;
  background: linear-gradient(90deg, var(--gradient-from) 0%, var(--gradient-to) 100%);
  transform-origin: right;
`;

const EdgeLeft = styled(Edge)`
  left: -4px;
  background: linear-gradient(270deg, var(--gradient-from) 0%, var(--gradient-to) 100%);
  transform-origin: left;
`;

const BubbleWrapperRoot = styled.div<{
  mounted: boolean;
  isHovered: boolean;
  isCurrentPath: boolean;
}>`
  &:not(:first-of-type) {
    margin-left: -10px;
  }

  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: translateX(${BUBBLE_TRANSITION_SIZE}px);
  opacity: 0;

  z-index: ${({ isHovered, isCurrentPath }) => (isHovered ? 2 : isCurrentPath ? 1 : 0)};
  ${({ mounted }) => {
    if (!mounted) return;

    return `
    transform: translateX(0);
    opacity: 1;
  `;
  }};
`;

export default PathBubbles;
