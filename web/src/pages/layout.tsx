import { useLabel } from '@/contexts/label/label-context';
import { Locale, localeOptions } from '@/contexts/label/labels';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const { search } = useLocation();
  const { locale, setLocale, labels } = useLabel();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="navbar sticky top-0 z-50 min-h-0 bg-base-200 p-0">
        <div className="navbar-start">
          <MobileNav />
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-1 p-0 text-lg">
            <li>
              <NavLink
                to={{
                  pathname: '/subjects',
                  search,
                }}
              >
                {labels.SUBJECTS}
              </NavLink>
            </li>
            <li>
              <NavLink
                to={{
                  pathname: '/planner',
                  search,
                }}
              >
                {labels.PLANNER}
              </NavLink>
            </li>
            <li>
              <NavLink
                to={{
                  pathname: '/results',
                  search,
                }}
              >
                {labels.RESULTS}
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="navbar-end px-2">
          <a
            className="btn btn-link btn-sm"
            href="https://github.com/landris006/schedule-planner"
            target="_blank"
          >
            <GitHubLogoIcon className="h-6 w-6" />
          </a>

          <select
            name="locale"
            id="locale"
            value={locale}
            className="select select-bordered select-sm"
            onChange={(e) => setLocale(e.target.value as Locale)}
          >
            {localeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex-1">
        <Outlet />
      </div>

      <footer className="footer footer-center bg-base-300 p-4 text-base-content">
        <aside>
          <p>
            {labels.ISSUE_NOTICE}{' '}
            <a
              className="link link-primary"
              href="https://github.com/landris006/schedule-planner/issues"
              target="_blank"
            >
              {labels.HERE}
            </a>
            .
          </p>
        </aside>
      </footer>
    </div>
  );
}

function MobileNav() {
  const { labels } = useLabel();
  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h8m-8 6h16"
          />
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-box bg-base-200 p-2 shadow-2xl"
      >
        <li>
          <NavLink to="/subjects">{labels.SUBJECTS}</NavLink>
        </li>
        <li>
          <NavLink to="/planner">{labels.PLANNER}</NavLink>
        </li>
        <li>
          <NavLink to="/results">{labels.RESULTS}</NavLink>
        </li>
      </ul>
    </div>
  );
}
