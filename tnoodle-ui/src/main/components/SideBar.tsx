import {
    DesktopOutlined,
    SelectOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import "antd/dist/antd.css";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import tnoodleApi from "../api/tnoodle.api";
import wcaApi from "../api/wca.api";
import logo from "../assets/tnoodle_logo.svg";
import RootState from "../model/RootState";
import {
    setCompetitionId,
    setCompetitions,
} from "../redux/slice/CompetitionSlice";
import { setSuggestedFmcTranslations } from "../redux/slice/FmcSlice";
import { addCachedObject, setMe } from "../redux/slice/InformationSlice";
import { setBestMbldAttempt } from "../redux/slice/MbldSlice";
import { setFileZip } from "../redux/slice/ScramblingSlice";
import {
    setCompetitionName,
    setEditingStatus,
    setWcif,
} from "../redux/slice/WcifSlice";
import { getDefaultCompetitionName } from "../util/competition.name.util";
import {
    deleteParameter,
    getQueryParameter,
    setQueryParameter,
} from "../util/query.param.util";
import { defaultWcif } from "../util/wcif.util";
import Loading from "./Loading";
import "./SideBar.css";

const { Sider } = Layout;

const SideBar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [loadingUser, setLoadingUser] = useState(false);
    const [loadingCompetitions, setLoadingCompetitions] = useState(false);
    const [loadingCompetitionInfo, setLoadingCompetitionInfo] = useState(false);

    const me = useSelector((state: RootState) => state.informationSlice.me);
    const competitions = useSelector(
        (state: RootState) => state.competitionSlice.competitions
    );
    const cachedObjects = useSelector(
        (state: RootState) => state.informationSlice.cachedObjects
    );
    const generatingScrambles = useSelector(
        (state: RootState) => state.scramblingSlice.generatingScrambles
    );
    const dispatch = useDispatch();

    const getUserInfo = () => {
        if (!wcaApi.isLogged()) {
            return;
        }

        setLoadingUser(true);
        wcaApi
            .fetchMe()
            .then((response) => dispatch(setMe(response.data.me)))
            .finally(() => setLoadingUser(false));
    };

    const getCompetitionInfo = () => {
        if (!wcaApi.isLogged() || !!competitions) {
            return;
        }

        setLoadingCompetitions(true);
        wcaApi
            .getUpcomingManageableCompetitions()
            .then((response) => dispatch(setCompetitions(response.data)))
            .finally(() => setLoadingCompetitions(false));

        let competitionId = getQueryParameter("competitionId");
        if (!!competitionId) {
            handleCompetitionSelection(competitionId);
        }
    };

    const pluralize = (string: string, number: number) =>
        string + (number > 1 ? "s" : "");

    const handleManualSelection = () => {
        dispatch(setEditingStatus(true));
        dispatch(setCompetitionId());
        dispatch(setWcif({ ...defaultWcif }));
        dispatch(setBestMbldAttempt());
        dispatch(setCompetitionName(getDefaultCompetitionName()));
        dispatch(setFileZip());
        dispatch(setSuggestedFmcTranslations());

        deleteParameter("competitionId");
    };

    const getAndCacheBestMbldAttempt = useCallback(
        (wcif) => {
            tnoodleApi.fetchBestMbldAttempt(wcif).then((response) => {
                let attempted = response.data.attempted;
                dispatch(
                    addCachedObject({
                        competitionId: wcif.id,
                        identifier: "bestMbldAttempt",
                        object: attempted,
                    })
                );
                dispatch(setBestMbldAttempt(attempted));
            });
        },
        [dispatch]
    );

    const getAndCacheSuggestedFmcTranslations = useCallback(
        (wcif) => {
            tnoodleApi.fetchSuggestedFmcTranslations(wcif).then((response) => {
                dispatch(
                    addCachedObject({
                        competitionId: wcif.id,
                        identifier: "suggestedFmcTranslations",
                        object: response.data,
                    })
                );
                dispatch(setSuggestedFmcTranslations(response.data));
            });
        },
        [dispatch]
    );

    // In case we use competitionId from query params, it's not fetched.
    // We add it to the list.
    const maybeAddCompetition = useCallback(
        (competitionId, competitionName) => {
            if (!competitions) {
                return;
            }
            if (
                !competitions.find(
                    (competition) => competition.name === competitionName
                )
            ) {
                dispatch(
                    setCompetitions([
                        ...competitions,
                        { id: competitionId, name: competitionName },
                    ])
                );
            }
        },
        [dispatch, competitions]
    );

    const updateWcif = useCallback(
        (wcif) => {
            dispatch(setEditingStatus(false));
            dispatch(setWcif(wcif));
            dispatch(setCompetitionId(wcif.id));
            dispatch(setCompetitionId(wcif.name));
            dispatch(setFileZip());
        },
        [dispatch]
    );

    const handleCompetitionSelection = useCallback(
        (competitionId) => {
            setQueryParameter("competitionId", competitionId);

            // For quick switching between competitions.
            let cachedObject = cachedObjects[competitionId];
            if (!!cachedObject) {
                let cachedWcif = cachedObject.wcif;
                updateWcif(cachedWcif);
                maybeAddCompetition(cachedWcif.id, cachedWcif.name);

                let cachedSuggestedFmcTranslations =
                    cachedObject.suggestedFmcTranslations;
                dispatch(
                    setSuggestedFmcTranslations(cachedSuggestedFmcTranslations)
                );

                let cachedBestMbldAttempt = cachedObject.bestMbldAttempt;
                dispatch(setBestMbldAttempt(cachedBestMbldAttempt));
            } else {
                setLoadingCompetitionInfo(true);

                wcaApi
                    .getCompetitionJson(competitionId)
                    .then((response) => {
                        updateWcif(response.data);
                        dispatch(
                            addCachedObject({
                                competitionId,
                                identifier: "wcif",
                                object: response.data,
                            })
                        );
                        maybeAddCompetition(
                            response.data.id,
                            response.data.name
                        );
                        getAndCacheSuggestedFmcTranslations(response.data);
                        getAndCacheBestMbldAttempt(response.data);
                    })
                    .finally(() => setLoadingCompetitionInfo(false));
            }
        },
        [
            cachedObjects,
            dispatch,
            getAndCacheBestMbldAttempt,
            getAndCacheSuggestedFmcTranslations,
            maybeAddCompetition,
            updateWcif,
        ]
    );

    useEffect(getUserInfo, [dispatch]);
    useEffect(getCompetitionInfo, [
        dispatch,
        handleCompetitionSelection,
        competitions,
    ]);

    const loadingElement = (text: string) => (
        <div className="text-white">
            <Loading />
            <p>{text}...</p>
        </div>
    );

    const loadingArea = () => {
        if (loadingUser) {
            return loadingElement("Loading user");
        }

        if (loadingCompetitions) {
            return loadingElement("Loading competitions");
        }

        if (loadingCompetitionInfo) {
            return loadingElement("Loading competition information");
        }
    };
    return (
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
            <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
                <div id="tnoodle-logo-wrapper">
                    <img src={logo} alt="TNoodle logo" id="tnoodle-logo" />
                    {!collapsed && <h1 id="title">TNoodle</h1>}
                </div>

                {!!competitions && competitions.length > 0 && (
                    <Menu.Item
                        key="1"
                        icon={<SelectOutlined />}
                        onClick={handleManualSelection}
                    >
                        Manual Selection
                    </Menu.Item>
                )}
                {competitions?.map((competition) => (
                    <Menu.Item
                        key={competition.id}
                        icon={<DesktopOutlined />}
                        disabled={generatingScrambles}
                        onClick={() =>
                            handleCompetitionSelection(competition.id)
                        }
                    >
                        {competition.name}
                    </Menu.Item>
                ))}
                <Menu.Item
                    key="login"
                    icon={<UserOutlined />}
                    onClick={wcaApi.isLogged() ? wcaApi.logOut : wcaApi.logIn}
                    disabled={generatingScrambles}
                >
                    {wcaApi.isLogged() ? "Log Out" : "Log In"}
                </Menu.Item>
            </Menu>

            {!!me && !collapsed && (
                <p id="welcome-user">
                    Welcome, {me.name}.
                    {!!competitions &&
                        ` You have ${
                            competitions.length
                        } manageable ${pluralize(
                            " competition",
                            competitions.length
                        )} upcoming.`}
                </p>
            )}
            <div>{loadingArea()}</div>
        </Sider>
    );
};

export default SideBar;
