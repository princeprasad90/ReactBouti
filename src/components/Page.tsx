import React, { useEffect } from 'react';
import PropTypes from 'utils/propTypes';
import bn from 'utils/bemnames';
import { useHistory } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { getCookie } from '../network';
import Typography from './Typography';

const bem = bn.create('page');

interface BreadcrumbItemProps {
  name: string;
  active: boolean;
}

interface PageProps {
  title?: string | React.ReactElement;
  breadcrumbs?: BreadcrumbItemProps[];
  tag?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

const Page: React.FC<PageProps> = ({
  title,
  breadcrumbs,
  tag: Tag = 'div',
  className,
  children,
  ...restProps
}) => {
  const classes = bem.b('px-3', className);
  const history = useHistory();
  useEffect(() => {
    let accessToken = getCookie("accessToken")
    if (accessToken == 'undefined' || accessToken == '') {
       history.push('/');
    }
  }, []);

  return (
    <Tag className={classes} {...restProps}>
       {/* <ToastContainer /> */}
      <div className={bem.e('header')}>
        {title && typeof title === 'string' ? (
          <Typography type="h1" className={bem.e('title')}>
            {title}
          </Typography>
        ) : (
            title
          )}
        {breadcrumbs && (
          <Breadcrumb className={bem.e('breadcrumb')}>
            <BreadcrumbItem>Home</BreadcrumbItem>
            {breadcrumbs.length &&
              breadcrumbs.map(({ name, active }, index) => (
                <BreadcrumbItem key={index} active={active}>
                  {name}
                </BreadcrumbItem>
              ))}
          </Breadcrumb>
        )}
      </div>
      {children}
    </Tag>
  );
};

Page.propTypes = {
  tag: PropTypes.component,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  className: PropTypes.string,
  children: PropTypes.node,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      active: PropTypes.bool,
    })
  ),
};

Page.defaultProps = {
  tag: 'div',
  title: '',
};

export default Page;
