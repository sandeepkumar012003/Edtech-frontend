import { useEffect, useState } from "react";
import {
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { BsChevronDown } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { Link, matchPath, useLocation, useNavigate } from "react-router-dom";

import { logout } from "../../services/operations/authAPI";
import logo from "../../assets/Logo/Logo-Full-Light.png";
import { NavbarLinks } from "../../data/navbar-links";
import { apiConnector } from "../../services/apiConnector";
import { categories } from "../../services/apis";
import { ACCOUNT_TYPE } from "../../utils/constants";
import ProfileDropdown from "../core/Auth/ProfileDropdown";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);

  const [subLinks, setSubLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API);
        setSubLinks(res.data.data);
      } catch (error) {
        console.log("Could not fetch Categories.", error);
      }
      setLoading(false);
    })();
  }, []);

  const matchRoute = (route) => {
    if (!route || typeof route !== "string") return false;
    return matchPath({ path: route }, location.pathname);
  };

  const handleLogout = () => {
    dispatch(logout(navigate));
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <div
        className={`flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700 ${
          location.pathname !== "/" ? "bg-richblack-800" : ""
        } transition-all duration-200`}
      >
        <div className="flex items-center justify-between w-11/12 max-w-maxContent">
          {/* Logo */}
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex gap-x-6 text-richblack-25">
              {NavbarLinks.map((link, index) => (
                <li key={index}>
                  {link.title === "Catalog" ? (
                    <div
                      className={`group relative flex cursor-pointer items-center gap-1 ${
                        matchRoute("/catalog/:catalogName")
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      <p>{link.title}</p>
                      <BsChevronDown />
                      <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]">
                        <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                        {loading ? (
                          <p className="text-center">Loading...</p>
                        ) : subLinks?.length ? (
                          subLinks
                            ?.filter((subLink) => subLink?.courses?.length > 0)
                            ?.map((subLink, i) => (
                              <Link
                                to={`/catalog/${subLink.name
                                  .split(" ")
                                  .join("-")
                                  .toLowerCase()}`}
                                className="py-4 pl-4 bg-transparent rounded-lg hover:bg-richblack-50"
                                key={i}
                              >
                                <p>{subLink.name}</p>
                              </Link>
                            ))
                        ) : (
                          <p className="text-center">No Courses Found</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Link to={link?.path || "#"}>
                      <p
                        className={`${
                          matchRoute(link?.path)
                            ? "text-yellow-25"
                            : "text-richblack-25"
                        }`}
                      >
                        {link.title}
                      </p>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="items-center hidden gap-x-4 md:flex">
            {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
              <Link to="/dashboard/cart" className="relative">
                <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
                {totalItems > 0 && (
                  <span className="absolute grid w-5 h-5 text-xs font-bold text-yellow-100 rounded-full -bottom-2 -right-2 place-items-center bg-richblack-600">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {!token ? (
              <>
                <Link to="/login">
                  <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                    Log in
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                    Sign up
                  </button>
                </Link>
              </>
            ) : (
              <>
                <ProfileDropdown />
                <button
                  onClick={handleLogout}
                  className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? (
              <AiOutlineClose fontSize={24} fill="#AFB2BF" />
            ) : (
              <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="flex flex-col gap-4 px-6 py-4 md:hidden bg-richblack-900 text-richblack-25">
          {NavbarLinks.map((link, index) => (
            <Link
              key={index}
              to={link?.path || "#"}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${
                matchRoute(link?.path) ? "text-yellow-25" : "text-richblack-25"
              }`}
            >
              {link.title}
            </Link>
          ))}

          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link
              to="/dashboard/cart"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <AiOutlineShoppingCart className="text-xl" />
                <p>Cart ({totalItems})</p>
              </div>
            </Link>
          )}

          {!token ? (
            <>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full px-3 py-2 text-left border rounded bg-richblack-800 border-richblack-700">
                  Log in
                </button>
              </Link>
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full px-3 py-2 text-left border rounded bg-richblack-800 border-richblack-700">
                  Sign up
                </button>
              </Link>
            </>
          ) : (
            <>
              <ProfileDropdown />
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-left border rounded bg-richblack-800 border-richblack-700"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Navbar;
