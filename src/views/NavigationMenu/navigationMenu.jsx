import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTicketAlt,
	faColumns,
	faPlusCircle,
	faUserCog,
	faUserAlt,
	faPhoneAlt,
	faCog,
} from "@fortawesome/free-solid-svg-icons";
import { useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";

import UserContext from "../../UserContext";

import './navigationMenu.scss'

export const MenuLink = ({ icon, isBold, name, href, passedClassName, category }) => {
	const loc = useLocation();
	let isActiveLink =
		loc.pathname.includes(href)
		|| (category && loc.pathname.split('/')[1].includes(category));
  let cursorOverride = href ? "" : "default-cursor";
	const linkColor = isActiveLink ? "has-text-black" : "has-text-white";

	return (
		<li className={passedClassName ? `pb-2 ${passedClassName}` : "pb-2"}>
			<Link to={href} className={`is-size-7 ${isBold && "has-text-weight-bold"} ${linkColor} ${cursorOverride}`}>
				{icon && (
					<span className="icon is-small">
						<FontAwesomeIcon icon={icon} />
					</span>
				)}
				<span className="pl-1">{name}</span>
			</Link>
		</li>
	);
};

MenuLink.propTypes = {
	icon: PropTypes.object,
	isBold: PropTypes.bool,
	name: PropTypes.string.isRequired,
	href: PropTypes.string.isRequired,
	passedClassName: PropTypes.string
};

export const NavMenu = () => {
	const loc = useLocation();
	if (
		loc.pathname === "/login" ||
		loc.pathname === "/signup" ||
		loc.pathname === "/terms"
	) {
		return null;
	}

	return (
		<UserContext.Consumer>
			{({ user }) => (
				<div className="is-hidden-mobile has-background-primary sidebar-menu">
					<div className="menu">
						<ul className="menu-list">
							<MenuLink
								name={`${user.firstName} ${user.lastName}`}
								isBold
								icon={faUserAlt}
								href="/home"
								passedClassName="pb-5"
							/>
							<MenuLink
								name="Dashboard"
								isBold
								icon={faColumns}
								href="/dashboard"
								category="dashboard"
							/>
							<MenuLink name="Add New" isBold icon={faPlusCircle} category="add" />
							<div className="pl-4 is-child-link">
								<MenuLink name="Tenant" href="/add/tenant" />
								<MenuLink name="Property" href="/add/property" />
								<MenuLink name="Property Manager" href="/add/manager" />
								<MenuLink name="Ticket" href="/add/ticket" />
							</div>

							<MenuLink name="Manage" isBold icon={faUserCog} category="manage" />
							<div className="pl-4 is-child-link">
								<MenuLink name="Tenants" href="/manage/tenants" />
								<MenuLink name="Properties" href="/manage/properties" />
								<MenuLink name="Property Managers" href="/manage/managers" />
								<MenuLink name="Tickets" href="/manage/tickets" />
							</div>

							<MenuLink name="JOIN Staff" isBold icon={faUserAlt} href="/staff" />
							<MenuLink name="Emergency Numbers" isBold icon={faPhoneAlt} href="/emergency" />
							<MenuLink name="Settings" isBold icon={faCog} href="/settings" />
						</ul>
					</div>
				</div>
			)}
		</UserContext.Consumer>
	);
}
