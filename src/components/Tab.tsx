import "./Tab.css";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
	faArrowLeft,
	faBars,
	faFile,
	faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type MouseEventHandler, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { homePath, savedNotesPath } from "../constants";
import { useAppDispatch, useAppSelector } from "../hooks";
import { selectAllStringResources } from "../localeSlice";
import {
	formatNoteText,
	hasUnsavedChanges,
	initializeActiveNote,
	saveActiveNote,
	selectActiveNote,
	selectActiveNoteThumbnail,
	selectAllSavedNotes,
	shouldWarnBeforeLeaving,
} from "../notesSlice";
import { updateToastText } from "../toastTextSlice";
import { getNoteTitle, type Note } from "../utils";
import { Button } from "./Button";
import { NoteStatus } from "./NoteStatus";

export const Tab = () => {
	const dispatch = useAppDispatch();
	const stringResources = useSelector(selectAllStringResources);
	const activeNote = useAppSelector(selectActiveNote);
	const tabViewListRef = useRef<HTMLUListElement | null>(null);
	const navigate = useNavigate();
	const location = useLocation();
	const shouldWarn = useAppSelector(shouldWarnBeforeLeaving);

	const resetScroll = () => {
		if (tabViewListRef.current) {
			tabViewListRef.current.scrollTo({ left: 0 });
		}
	};

	const createNote = () => {
		if (!shouldWarn || window.confirm(stringResources.messageUnsavedChanges)) {
			dispatch(initializeActiveNote());
			navigate(homePath);
			resetScroll();
		}
	};

	const importNote = () => {
		alert("Not implemented");
	};

	useEffect(() => {
		const handleKeyDown = async (event: KeyboardEvent) => {
			// Save
			if ((event.ctrlKey || event.metaKey) && event.key === "s") {
				event.preventDefault();
				if (activeNote) {
					await dispatch(formatNoteText());
					dispatch(saveActiveNote());
					dispatch(updateToastText("messageSaveSuccess"));
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [dispatch, activeNote]);

	return (
		<div className="tab-view">
			<ul className="tab-view-list" ref={tabViewListRef}>
				{location.pathname === homePath && (
					<TabAction
						onClick={() => navigate(savedNotesPath)}
						icon={faBars}
						accessibilityLabel={stringResources.savedNotes}
					/>
				)}

				{location.pathname === savedNotesPath && (
					<TabAction
						onClick={() => navigate(homePath)}
						icon={faArrowLeft}
						accessibilityLabel={stringResources.home}
					/>
				)}

				{activeNote && <TabItem note={activeNote} />}

				<TabActionWithLabel
					onClick={createNote}
					icon={faPlus}
					primaryLabel={stringResources.create}
					secondaryLabel={stringResources.createLabel}
					accessibilityLabel={stringResources.createAccessibilityLabel}
				/>

				<TabActionWithLabel
					onClick={importNote}
					icon={faFile}
					primaryLabel={stringResources.import}
					secondaryLabel={stringResources.importLabel}
					accessibilityLabel={stringResources.importAccessibilityLabel}
				/>
			</ul>
		</div>
	);
};

interface TabItemProps {
	note: Note;
}

const TabItem = ({ note }: TabItemProps) => {
	const dispatch = useAppDispatch();
	const noteTitle = getNoteTitle(note.text);
	const thumbnail = useAppSelector(selectActiveNoteThumbnail);
	const savedNote =
		useAppSelector(selectAllSavedNotes).filter(
			(savedNote) => savedNote.id === note.id,
		)[0] ?? null;
	const untitled = noteTitle === null;
	const stringResources = useSelector(selectAllStringResources);

	const save = () => {
		if (
			savedNote === null ||
			note?.id === savedNote.id ||
			window.confirm(
				"You are about to overwrite an existing note. " +
					"Do you want to proceed?",
			)
		) {
			dispatch(saveActiveNote());
			dispatch(updateToastText("messageSaveSuccess"));
		}
	};

	return (
		<li className="tab-view-status" key={note.id}>
			<div className="tab-view-item-container">
				{thumbnail && (
					<div className="tab-view-item-icon">
						<img
							src={thumbnail.url}
							alt={thumbnail.alt}
							title={thumbnail.title}
						/>
					</div>
				)}

				<div className="tab-view-item-content">
					<div className="tab-view-item-title">
						{untitled ? (
							<span className="tab-view-item-title-untitled">
								{stringResources.untitled}
							</span>
						) : (
							<span title={noteTitle}>{noteTitle}</span>
						)}
					</div>

					<div className="tab-view-item-status">
						<NoteStatus note={note} />
					</div>
				</div>

				<div className="tab-view-item-button">
					<Button
						level="secondary"
						onClick={save}
						disabled={!useAppSelector(hasUnsavedChanges)}
					>
						{stringResources.save}
					</Button>
				</div>
			</div>
		</li>
	);
};

interface TabActionProps {
	onClick: MouseEventHandler<HTMLButtonElement>;
	icon: IconProp;
	accessibilityLabel: string;
}

const TabAction = ({ onClick, icon, accessibilityLabel }: TabActionProps) => {
	return (
		<li className="tab-view-action tab-view-action-with-no-label">
			<button
				className="tab-view-item-container"
				type="button"
				onClick={onClick}
				title={accessibilityLabel}
			>
				<div className="tab-view-item-icon">
					<FontAwesomeIcon icon={icon} />
				</div>
			</button>
		</li>
	);
};

interface TabActionWithLabelProps {
	onClick: MouseEventHandler<HTMLButtonElement>;
	icon: IconProp;
	primaryLabel: string;
	secondaryLabel: string;
	accessibilityLabel: string;
}

const TabActionWithLabel = ({
	onClick,
	icon,
	primaryLabel,
	secondaryLabel,
	accessibilityLabel,
}: TabActionWithLabelProps) => {
	return (
		<li className="tab-view-action tab-view-action-with-label">
			<button
				className="tab-view-item-container"
				type="button"
				onClick={onClick}
				title={accessibilityLabel}
			>
				<div className="tab-view-item-icon">
					<FontAwesomeIcon icon={icon} />
				</div>

				<div className="tab-view-item-content">
					<div className="tab-view-item-title">{primaryLabel}</div>
					<div className="tab-view-item-status">{secondaryLabel}</div>
				</div>
			</button>
		</li>
	);
};
