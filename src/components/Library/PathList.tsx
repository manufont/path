/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import List from "@mui/material/List";
import { StoredPath } from "contexts/Library";
import { Path } from "hooks/usePath";
import { useState, useRef, useEffect } from "react";
import { css, useTheme } from "@mui/material/styles";
import PathListItem from "./PathListItem";

type PathListProps = {
  currentPath: Path | null;
  paths: StoredPath[];
  hoveredPathId: string | null;
  setHoveredPathId: (path: string | null) => void;
};

const EDGE_HEIGHT = 30;

const PathList = ({ paths, currentPath, ...otherProps }: PathListProps) => {
  // const { deletePath } = useContext(LibraryContext);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const darkTheme = theme.palette.mode === "dark";

  const [scaleEdgeBottom, setScaleEdgeBottom] = useState(0);
  const [scaleEdgeTop, setScaleEdgeTop] = useState(0);

  const onScroll = () => {
    if (!scrollRef.current) return;
    const { scrollHeight, clientHeight, scrollTop } = scrollRef.current;
    const hiddenWidthRight = scrollHeight - clientHeight - scrollTop;
    setScaleEdgeBottom(Math.min(hiddenWidthRight / EDGE_HEIGHT, 1));
    setScaleEdgeTop(Math.min(scrollTop / EDGE_HEIGHT, 1));
  };

  useEffect(() => {
    const scrollElt = scrollRef.current;
    if (!scrollElt) return;
    const observer = new ResizeObserver(onScroll);
    observer.observe(scrollElt);
    return () => {
      observer.disconnect();
    };
  }, []);

  const currentPathIsStored = currentPath && paths.find(({ id }) => id === currentPath.id);

  useEffect(() => {
    if (!currentPath) return;
    // we auto scroll on the current path if present
    const pathEntry = document.getElementById(`path-entry-${currentPath.id}`);
    if (!pathEntry) return;
    pathEntry.scrollIntoView();
  }, [currentPath, currentPathIsStored]);

  return (
    <Root
      css={css`
        --gradient-from: ${darkTheme ? "#1e1e1e00" : "#fff0"};
        --gradient-to: ${darkTheme ? "#1e1e1eff" : "#ffff"};
      `}
    >
      <ScrollablePart ref={scrollRef} onScroll={onScroll}>
        <List>
          {paths.map((path) => (
            <PathListItem
              key={path.id}
              id={`path-entry-${path.id}`}
              path={path}
              currentPath={currentPath}
              {...otherProps}
            />
          ))}
        </List>
      </ScrollablePart>
      <EdgeBottom
        css={css`
          transform: scaleY(${scaleEdgeBottom});
        `}
      />
      <EdgeTop
        css={css`
          transform: scaleY(${scaleEdgeTop});
        `}
      />
    </Root>
  );
};

const Root = styled.div`
  position: relative;
`;

const ScrollablePart = styled.div`
  max-height: 300px;
  overflow: auto;
`;

const Edge = styled.div`
  position: absolute;
  height: ${EDGE_HEIGHT}px;
  left: 0;
  right: 0;
`;

const EdgeBottom = styled(Edge)`
  bottom: 0;
  background: linear-gradient(180deg, var(--gradient-from) 0%, var(--gradient-to) 100%);
  transform-origin: bottom;
`;

const EdgeTop = styled(Edge)`
  top: 0;
  background: linear-gradient(0deg, var(--gradient-from) 0%, var(--gradient-to) 100%);
  transform-origin: top;
`;

export default PathList;
