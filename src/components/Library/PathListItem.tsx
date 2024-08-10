/** @jsxImportSource @emotion/react */
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import { LibraryContext, StoredPath } from "contexts/Library";
import { Path } from "hooks/usePath";
import PathBubble from "./PathBubble";
import { useContext, useEffect, useState } from "react";
import { IconButton, ListItemIcon, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";

type PathListItemProps = {
  id: string;
  currentPath: Path | null;
  path: StoredPath;
  hoveredPathId: string | null;
  setHoveredPathId: (path: string | null) => void;
};

const dateTimeFormat = new Intl.DateTimeFormat();

const PathListItem = ({
  id,
  path,
  currentPath,
  hoveredPathId,
  setHoveredPathId,
}: PathListItemProps) => {
  const { deletePath } = useContext(LibraryContext);
  const [anchorEl, setAnchorEl] = useState<null | Element>(null);
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

  const onMenuButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget) {
      setAnchorEl(e.currentTarget);
    }
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const isCurrentPath = currentPath?.id === path.id;

  return (
    <>
      <ListItemButton
        id={id}
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
        selected={isCurrentPath}
        href={`/${path.pathSearch}`}
      >
        <ListItemAvatar>
          <PathBubble
            currentPath={currentPath}
            hoveredPathId={hoveredPathId}
            path={path}
            size={64}
          />
        </ListItemAvatar>
        <ListItemText
          primary={path.trip.summary.length.toFixed(1) + " km"}
          secondary={dateTimeFormat.format(new Date(path.dateAdded))}
        />

        <IconButton onClick={onMenuButtonClick}>
          <MoreVertIcon />
        </IconButton>
      </ListItemButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={() => deletePath(path.id)}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default PathListItem;
