import Avatar from 'components/Avatar';
import React, { Fragment } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import PropTypes from 'utils/propTypes';

interface AvatarItem {
  avatar: string;
  name?: string;
}

interface HorizontalAvatarListProps {
  tag?: React.ElementType;
  avatars?: AvatarItem[];
  avatarProps?: Record<string, unknown>;
  reversed?: boolean;
  [key: string]: any;
}

const HorizontalAvatarList: React.FC<HorizontalAvatarListProps> = ({
  tag: Tag = 'div',
  avatars = [],
  avatarProps = {},
  reversed = false,
  ...restProps
}) => {
  let leng = reversed ? avatars.length + 1 : 1;
  const count = reversed ? () => leng-- : () => leng++;

  return (
    <Tag className="d-flex align-items-center" {...restProps}>
      {avatars &&
        avatars.map(({ avatar, name }, i) => {
          const index = count();
          const isFirstItem = i === 0;

          return (
            <Fragment key={index}>
              <Avatar
                {...avatarProps}
                id={`HorizontalAvatarList-avatar-${index}`}
                src={avatar}
                style={{
                  zIndex: index,
                  border: '3px solid #fff',
                  marginLeft: !isFirstItem && -20,
                  marginBottom: '20px',
                  marginTop:'20px'
                }}
              />

              {!!name && (
                <UncontrolledTooltip
                  delay={{ show: 0, hide: 0 }}
                  target={`HorizontalAvatarList-avatar-${index}`}>
                  {name}
                </UncontrolledTooltip>
              )}
            </Fragment>
          );
        })}
    </Tag>
  );
};

HorizontalAvatarList.propTypes = {
  tag: PropTypes.node,
  avatars: PropTypes.arrayOf(
    PropTypes.shape({
      avatar: PropTypes.string.isRequired,
      name: PropTypes.string,
    })
  ).isRequired,
  avatarProps: PropTypes.object,
  reversed: PropTypes.bool,
};

HorizontalAvatarList.defaultProps = {
  tag: 'div',
  avatars: [],
  avatarProps: {},
  reversed: false,
};

export default HorizontalAvatarList;
