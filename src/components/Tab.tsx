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
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { homePath, savedNotesPath } from "../constants";
import {
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

export function Tab() {
	const dispatch = useDispatch();
	const activeNote = useSelector(selectActiveNote);
	const tabViewListRef = useRef<HTMLUListElement | null>(null);
	const navigate = useNavigate();
	const location = useLocation();
	const shouldWarn = useSelector(shouldWarnBeforeLeaving);

	const resetScroll = () => {
		if (tabViewListRef.current) {
			tabViewListRef.current.scrollTo({ left: 0 });
		}
	};

	const createNote = () => {
		if (
			!shouldWarn ||
			window.confirm(
				"Create a new note without saving? " +
					"Any unsaved changes will be lost.",
			)
		) {
			dispatch(initializeActiveNote());
			navigate(homePath);
			resetScroll();
		}
	};

	const importNote = () => {
		alert("Not implemented");
	};

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Save
			if ((event.ctrlKey || event.metaKey) && event.key === "s") {
				event.preventDefault();
				dispatch(saveActiveNote());
				dispatch(updateToastText("saveSuccess"));
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [dispatch]);

	return (
		<div className="tab-view">
			<ul className="tab-view-list" ref={tabViewListRef}>
				{location.pathname === homePath && (
					<TabAction
						onClick={() => navigate(savedNotesPath)}
						icon={faBars}
						accessibilityLabel="See saved notes"
					/>
				)}

				{location.pathname === savedNotesPath && (
					<TabAction
						onClick={() => navigate(homePath)}
						icon={faArrowLeft}
						accessibilityLabel="Back to home"
					/>
				)}

				{activeNote && <TabItem note={activeNote} />}

				<TabActionWithLabel
					onClick={createNote}
					icon={faPlus}
					primaryLabel="New"
					secondaryLabel="in browser"
					accessibilityLabel="Create new note in browser"
				/>

				<TabActionWithLabel
					onClick={importNote}
					icon={faFile}
					primaryLabel="Import"
					secondaryLabel="from file"
					accessibilityLabel="Import note from file"
				/>
			</ul>
		</div>
	);
}

interface TabItemProps {
	note: Note;
}

function TabItem({ note }: TabItemProps) {
	const dispatch = useDispatch();
	const noteTitle = getNoteTitle(note.text);
	const thumbnail = useSelector(selectActiveNoteThumbnail);
	const savedNote =
		useSelector(selectAllSavedNotes).filter(
			(savedNote) => savedNote.id === note.id,
		)[0] ?? null;
	const untitled = noteTitle === null;

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
			dispatch(updateToastText("saveSuccess"));
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
							<span className="tab-view-item-title-untitled">Untitled</span>
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
						disabled={!useSelector(hasUnsavedChanges)}
					>
						Save
					</Button>
				</div>
			</div>
		</li>
	);
}

interface TabActionProps {
	onClick: MouseEventHandler<HTMLButtonElement>;
	icon: IconProp;
	accessibilityLabel: string;
}

function TabAction({ onClick, icon, accessibilityLabel }: TabActionProps) {
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
}

interface TabActionWithLabelProps {
	onClick: MouseEventHandler<HTMLButtonElement>;
	icon: IconProp;
	primaryLabel: string;
	secondaryLabel: string;
	accessibilityLabel: string;
}

function TabActionWithLabel({
	onClick,
	icon,
	primaryLabel,
	secondaryLabel,
	accessibilityLabel,
}: TabActionWithLabelProps) {
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
}
